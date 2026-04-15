package com.laioffer.deliverymanagement.tracking;

import com.laioffer.deliverymanagement.api.ApiException;
import com.laioffer.deliverymanagement.auth.AuthenticatedUser;
import com.laioffer.deliverymanagement.entity.OrderEntity;
import com.laioffer.deliverymanagement.repository.OrderRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class TrackingController {

    private final OrderRepository orderRepository;

    public TrackingController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/{orderId}/tracking")
    public TrackingResponse getTracking(@PathVariable UUID orderId) {

        // 1. 鉴权
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new ApiException(401, "UNAUTHORIZED", "Authorization header with Bearer token is required.");
        }

        // 2. 找订单
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(404, "ORDER_NOT_FOUND", "Order not found."));

        // 3. 权限检查：只能查自己的订单
        if (!order.userId().equals(user.id())) {
            throw new ApiException(403, "FORBIDDEN", "You do not have access to this order.");
        }

        // 4. 如果已送达，直接返回
        if ("DELIVERED".equals(order.status())) {
            return new TrackingResponse(
                    order.id(),
                    "DELIVERED",
                    order.vehicleTypeChosen(),
                    order.simLatitude(),
                    order.simLongitude(),
                    order.simHeadingDeg(),
                    0
            );
        }

        // 5. 读取 dropoff 坐标（从 trackingState JSONB 里取）
        BigDecimal dropoffLat;
        BigDecimal dropoffLng;
        try {
            var state = order.trackingState().value(); // JSON string
            // 简单解析：{"dropoffLat":37.76,"dropoffLng":-122.43,...}
            dropoffLat = extractDecimal(state, "dropoffLat");
            dropoffLng = extractDecimal(state, "dropoffLng");
        } catch (Exception e) {
            throw new ApiException(400, "TRACKING_NOT_READY", "Order tracking data is not yet available.");
        }

        // 6. 读当前 sim 位置，首次为 null 时从 DeliveryCenter 起点开始
        BigDecimal simLat = order.simLatitude();
        BigDecimal simLng = order.simLongitude();

        // 如果还没有 sim 位置，需要 F4 在支付时设置起点
        // 这里做保护：如果真的为 null 就用 dropoff 作为起点（不会移动）
        if (simLat == null || simLng == null) {
            simLat = dropoffLat;
            simLng = dropoffLng;
        }

        // 7. 计算移动
        double dLat = dropoffLat.doubleValue() - simLat.doubleValue();
        double dLng = dropoffLng.doubleValue() - simLng.doubleValue();
        double dist = Math.sqrt(dLat * dLat + dLng * dLng);

        String newStatus = order.status();
        BigDecimal newLat = simLat;
        BigDecimal newLng = simLng;
        BigDecimal newHeading = order.simHeadingDeg();

        if (dist < 0.002) {
            // 到达目的地
            newStatus = "DELIVERED";
            newLat = dropoffLat;
            newLng = dropoffLng;
        } else {
            // 移动一步
            double step = 0.001 / dist;
            newLat = BigDecimal.valueOf(simLat.doubleValue() + dLat * step)
                    .setScale(7, RoundingMode.HALF_UP);
            newLng = BigDecimal.valueOf(simLng.doubleValue() + dLng * step)
                    .setScale(7, RoundingMode.HALF_UP);
            // 计算朝向角度
            double headingRad = Math.atan2(dLng, dLat);
            newHeading = BigDecimal.valueOf(Math.toDegrees(headingRad))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // 8. 计算剩余 ETA
        double remainingKm = dist * 111.0;
        double speedKmh = "DRONE".equals(order.vehicleTypeChosen()) ? 40.0 : 15.0;
        int etaMinutes = (int) Math.ceil(remainingKm / speedKmh * 60);

        // 9. 更新数据库
        OrderEntity updated = new OrderEntity(
                order.id(), order.userId(), order.centerId(), order.fleetVehicleId(),
                newStatus, order.vehicleTypeChosen(),
                order.pickupSummary(), order.dropoffSummary(),
                order.handoffPin(), etaMinutes,
                order.totalAmount(), order.currency(),
                newLat, newLng, newHeading, OffsetDateTime.now(),
                order.planSnapshot(), order.trackingState(),
                order.createdAt(), OffsetDateTime.now(),
                order.version(), order.metadata()
        );
        orderRepository.save(updated);

        return new TrackingResponse(
                order.id(),
                newStatus,
                order.vehicleTypeChosen(),
                newLat,
                newLng,
                newHeading,
                etaMinutes
        );
    }

    // 简单从 JSON 字符串里提取数字字段，避免引入额外依赖
    private BigDecimal extractDecimal(String json, String key) {
        String search = "\"" + key + "\":";
        int idx = json.indexOf(search);
        if (idx < 0) throw new IllegalArgumentException("Key not found: " + key);
        int start = idx + search.length();
        int end = json.indexOf(',', start);
        if (end < 0) end = json.indexOf('}', start);
        return new BigDecimal(json.substring(start, end).trim());
    }
}