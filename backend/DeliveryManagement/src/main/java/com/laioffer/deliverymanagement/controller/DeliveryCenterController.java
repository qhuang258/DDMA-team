package com.laioffer.deliverymanagement.controller;

import com.laioffer.deliverymanagement.api.ApiException;
import com.laioffer.deliverymanagement.dto.DeliveryCenterDto;
import com.laioffer.deliverymanagement.dto.FleetVehicleDto;
import com.laioffer.deliverymanagement.service.DeliveryCenterService;
import com.laioffer.deliverymanagement.service.FleetVehicleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/centers")
public class DeliveryCenterController {

    private final DeliveryCenterService deliveryCenterService;
    private final FleetVehicleService fleetVehicleService;

    public DeliveryCenterController(DeliveryCenterService deliveryCenterService, FleetVehicleService fleetVehicleService) {
        this.deliveryCenterService = deliveryCenterService;
        this.fleetVehicleService = fleetVehicleService;
    }

    @GetMapping
    public List<DeliveryCenterDto> listCenters() {
        return deliveryCenterService.findAll();
    }

    @GetMapping("/{centerId}")
    public DeliveryCenterDto getCenter(@PathVariable UUID centerId) {
        return deliveryCenterService.findById(centerId)
                .orElseThrow(() -> new ApiException(404, "CENTER_NOT_FOUND", "Delivery center not found."));
    }

    @GetMapping("/{centerId}/vehicles")
    public List<FleetVehicleDto> listCenterVehicles(@PathVariable UUID centerId) {
        if (deliveryCenterService.findById(centerId).isEmpty()) {
            throw new ApiException(404, "CENTER_NOT_FOUND", "Delivery center not found.");
        }
        return fleetVehicleService.findByCenterId(centerId);
    }
}
