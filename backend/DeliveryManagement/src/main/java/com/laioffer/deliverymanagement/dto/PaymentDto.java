package com.laioffer.deliverymanagement.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PaymentDto(
        UUID id,
        UUID orderId,
        String stripePaymentIntentId,
        String status,
        BigDecimal amount,
        String currency,
        String idempotencyKey,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String providerPayload
) {
}
