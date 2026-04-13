package com.laioffer.deliverymanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Table("orders")
public record OrderEntity(
        @Id UUID id,
        UUID userId,
        UUID centerId,
        UUID fleetVehicleId,
        String status,
        String vehicleTypeChosen,
        String pickupSummary,
        String dropoffSummary,
        String handoffPin,
        Integer estimatedMinutes,
        BigDecimal totalAmount,
        String currency,
        BigDecimal simLatitude,
        BigDecimal simLongitude,
        BigDecimal simHeadingDeg,
        OffsetDateTime simUpdatedAt,
        Jsonb planSnapshot,
        Jsonb trackingState,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        @Version int version,
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
