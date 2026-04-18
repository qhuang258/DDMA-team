package com.laioffer.deliverymanagement.controller;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record OrderSummaryResponse(
        UUID orderId,
        String status,
        String dropoffSummary,
        String vehicleTypeChosen,
        BigDecimal totalAmount,
        String currency,
        OffsetDateTime createdAt
) {

}
