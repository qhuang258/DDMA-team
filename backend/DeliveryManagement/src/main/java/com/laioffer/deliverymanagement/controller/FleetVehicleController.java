package com.laioffer.deliverymanagement.controller;

import com.laioffer.deliverymanagement.api.ApiException;
import com.laioffer.deliverymanagement.dto.FleetVehicleDto;
import com.laioffer.deliverymanagement.service.FleetVehicleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vehicles")
public class FleetVehicleController {

    private final FleetVehicleService fleetVehicleService;

    public FleetVehicleController(FleetVehicleService fleetVehicleService) {
        this.fleetVehicleService = fleetVehicleService;
    }

    @GetMapping("/{vehicleId}")
    public FleetVehicleDto getVehicle(@PathVariable UUID vehicleId) {
        return fleetVehicleService.findById(vehicleId)
                .orElseThrow(() -> new ApiException(404, "VEHICLE_NOT_FOUND", "Fleet vehicle not found."));
    }
}
