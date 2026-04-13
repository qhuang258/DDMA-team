package com.laioffer.deliverymanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Table("order_parcel")
public record OrderParcelEntity(
        @Id UUID id,
        UUID orderId,
        String sizeTier,
        BigDecimal weightKg,
        boolean fragile,
        String deliveryNotes,
        Jsonb dimensions,
        Jsonb metadata
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
