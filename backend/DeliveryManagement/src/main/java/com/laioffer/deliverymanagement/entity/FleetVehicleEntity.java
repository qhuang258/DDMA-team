package com.laioffer.deliverymanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("fleet_vehicle")
public record FleetVehicleEntity(
        @Id UUID id,
        UUID centerId,
        String vehicleType,
        boolean available,
        String externalDeviceId,
        Jsonb telemetryHint,
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
