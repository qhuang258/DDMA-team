package com.laioffer.deliverymanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Table("payment")
public record PaymentEntity(
        @Id UUID id,
        UUID orderId,
        String stripePaymentIntentId,
        String status,
        BigDecimal amount,
        String currency,
        String idempotencyKey,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        Jsonb providerPayload
) implements Persistable<UUID> {

    @Override
    public UUID getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return id == null;
    }
}
