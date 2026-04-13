package com.laioffer.deliverymanagement.service;

import com.laioffer.deliverymanagement.dto.FleetVehicleDto;
import com.laioffer.deliverymanagement.entity.FleetVehicleEntity;
import com.laioffer.deliverymanagement.repository.FleetVehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FleetVehicleService {

    private final FleetVehicleRepository repository;

    public FleetVehicleService(FleetVehicleRepository repository) {
        this.repository = repository;
    }

    public List<FleetVehicleDto> findAll() {
        return repository.findAll().stream().map(FleetVehicleService::toDto).toList();
    }

    public List<FleetVehicleDto> findByCenterId(UUID centerId) {
        return repository.findByCenterId(centerId).stream().map(FleetVehicleService::toDto).toList();
    }

    public Optional<FleetVehicleDto> findById(UUID id) {
        return repository.findById(id).map(FleetVehicleService::toDto);
    }

    public long count() {
        return repository.count();
    }

    private static FleetVehicleDto toDto(FleetVehicleEntity e) {
        return new FleetVehicleDto(
                e.id(),
                e.centerId(),
                e.vehicleType(),
                e.available(),
                e.externalDeviceId(),
                e.telemetryHint() == null ? null : e.telemetryHint().value(),
                e.metadata() == null ? null : e.metadata().value()
        );
    }
}
