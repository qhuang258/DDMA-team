package com.laioffer.deliverymanagement.controller;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateParcelResponse(
        UUID parcelId,
        UUID orderId,
        String sizeTier,
        BigDecimal weightKg
) {
}
