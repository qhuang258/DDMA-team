package com.laioffer.deliverymanagement.repository;

import com.laioffer.deliverymanagement.entity.FleetVehicleEntity;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.UUID;

public interface FleetVehicleRepository extends ListCrudRepository<FleetVehicleEntity, UUID> {

    List<FleetVehicleEntity> findByCenterId(UUID centerId);
}
