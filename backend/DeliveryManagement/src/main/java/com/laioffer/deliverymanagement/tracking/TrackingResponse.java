package com.laioffer.deliverymanagement.tracking;

import java.math.BigDecimal;
import java.util.UUID;

public record TrackingResponse(
        UUID orderId,
        String status,
        String vehicleType,
        String handoffPin,
        BigDecimal simLat,
        BigDecimal simLng,
        BigDecimal simHeadingDeg,
        Integer etaMinutes,
        BigDecimal startLat,
        BigDecimal startLng,
        BigDecimal dropoffLat,
        BigDecimal dropoffLng
) {}
