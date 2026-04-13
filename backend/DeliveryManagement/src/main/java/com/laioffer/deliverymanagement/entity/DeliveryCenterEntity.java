package com.laioffer.deliverymanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Table("delivery_center")
public record DeliveryCenterEntity(
        @Id UUID id,
        String name,
        BigDecimal latitude,
        BigDecimal longitude,
        String addressLine,
        Jsonb serviceAreaGeo,
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
