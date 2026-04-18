package com.laioffer.deliverymanagement.service;

import com.laioffer.deliverymanagement.dto.OrderDto;
import com.laioffer.deliverymanagement.entity.Jsonb;
import com.laioffer.deliverymanagement.entity.OrderEntity;
import com.laioffer.deliverymanagement.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public List<OrderDto> findAll() {
        return repository.findAll().stream().map(OrderService::toDto).toList();
    }

    public List<OrderDto> findByUserId(UUID userId) {
        return repository.findByUserId(userId).stream().map(OrderService::toDto).toList();
    }

    public Optional<OrderDto> findById(UUID id) {
        return repository.findById(id).map(OrderService::toDto);
    }

    @Transactional
    public OrderDto createOrder(
            UUID userId,
            UUID centerId,
            String pickupSummary,
            BigDecimal pickupLat,
            BigDecimal pickupLng,
            String dropoffSummary,
            BigDecimal dropoffLat,
            BigDecimal dropoffLng
    ) {
        OffsetDateTime now = OffsetDateTime.now();

        // Store real geocoded dropoff coordinates immediately so payment step preserves them
        Jsonb trackingState = null;
        if (dropoffLat != null && dropoffLng != null) {
            String json = String.format(
                    "{\"lastEvent\":\"CREATED\",\"dropoffLat\":%s,\"dropoffLng\":%s}",
                    dropoffLat.toPlainString(), dropoffLng.toPlainString()
            );
            trackingState = Jsonb.of(json);
        }

        OrderEntity saved = repository.save(new OrderEntity(
                null,
                userId,
                centerId,
                null,
                "PENDING",
                null,
                pickupSummary,
                dropoffSummary,
                null,
                null,
                null,
                "USD",
                null,
                null,
                null,
                null,
                null,
                trackingState,
                now,
                now,
                0,
                null
        ));
        return toDto(saved);
    }

    @Transactional
    public OrderDto processPayment(
            UUID orderId,
            UUID fleetVehicleId,
            String vehicleType,
            String handoffPin,
            int estimatedMinutes,
            BigDecimal totalAmount,
            BigDecimal startLatitude,
            BigDecimal startLongitude
    ) {
        OrderEntity existing = repository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        OffsetDateTime now = OffsetDateTime.now();
        Jsonb trackingState = ensureTrackingState(existing, startLatitude, startLongitude);
        OrderEntity updated = new OrderEntity(
                existing.id(),
                existing.userId(),
                existing.centerId(),
                fleetVehicleId,
                "IN_TRANSIT",
                vehicleType,
                existing.pickupSummary(),
                existing.dropoffSummary(),
                handoffPin,
                estimatedMinutes,
                totalAmount,
                "USD",
                startLatitude,
                startLongitude,
                BigDecimal.ZERO,
                now,
                existing.planSnapshot(),
                trackingState,
                existing.createdAt(),
                now,
                existing.version(),
                existing.metadata()
        );
        return toDto(repository.save(updated));
    }

    private static Jsonb ensureTrackingState(
            OrderEntity existing,
            BigDecimal startLatitude,
            BigDecimal startLongitude
    ) {
        if (existing.trackingState() != null) {
            String trackingJson = existing.trackingState().value();
            if (trackingJson.contains("\"dropoffLat\"") && trackingJson.contains("\"dropoffLng\"")) {
                return existing.trackingState();
            }
        }

        BigDecimal dropoffLatitude = deriveDropoffLatitude(startLatitude, existing.dropoffSummary());
        BigDecimal dropoffLongitude = deriveDropoffLongitude(startLongitude, existing.dropoffSummary());

        String trackingJson = String.format(
                "{\"lastEvent\":\"PICKED_UP\",\"dropoffLat\":%s,\"dropoffLng\":%s}",
                dropoffLatitude.toPlainString(),
                dropoffLongitude.toPlainString()
        );
        return Jsonb.of(trackingJson);
    }

    private static BigDecimal deriveDropoffLatitude(BigDecimal centerLatitude, String dropoffSummary) {
        int hash = Math.abs(dropoffSummary == null ? 0 : dropoffSummary.hashCode());
        double offset = 0.010 + (hash % 15) / 1000.0;
        int sign = ((hash >> 1) & 1) == 0 ? 1 : -1;
        return centerLatitude
                .add(BigDecimal.valueOf(sign * offset))
                .setScale(7, RoundingMode.HALF_UP);
    }

    private static BigDecimal deriveDropoffLongitude(BigDecimal centerLongitude, String dropoffSummary) {
        int hash = Math.abs(dropoffSummary == null ? 0 : dropoffSummary.hashCode());
        double offset = 0.010 + ((hash / 31) % 15) / 1000.0;
        int sign = ((hash >> 2) & 1) == 0 ? 1 : -1;
        return centerLongitude
                .add(BigDecimal.valueOf(sign * offset))
                .setScale(7, RoundingMode.HALF_UP);
    }

    public long count() {
        return repository.count();
    }

    private static OrderDto toDto(OrderEntity e) {
        return new OrderDto(
                e.id(),
                e.userId(),
                e.centerId(),
                e.fleetVehicleId(),
                e.status(),
                e.vehicleTypeChosen(),
                e.pickupSummary(),
                e.dropoffSummary(),
                e.handoffPin(),
                e.estimatedMinutes(),
                e.totalAmount(),
                e.currency(),
                e.simLatitude(),
                e.simLongitude(),
                e.simHeadingDeg(),
                e.simUpdatedAt(),
                e.planSnapshot() == null ? null : e.planSnapshot().value(),
                e.trackingState() == null ? null : e.trackingState().value(),
                e.createdAt(),
                e.updatedAt(),
                e.version(),
                e.metadata() == null ? null : e.metadata().value()
        );
    }
}
