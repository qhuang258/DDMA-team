package com.laioffer.deliverymanagement.service;

import com.laioffer.deliverymanagement.dto.OrderDto;
import com.laioffer.deliverymanagement.entity.OrderEntity;
import com.laioffer.deliverymanagement.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public List<OrderDto> findAll() {
        return repository.findAll().stream().map(OrderService::toDto).toList();
    }

    public List<OrderDto> findByUserId(UUID userId) {
        return repository.findByUserId(userId).stream().map(OrderService::toDto).toList();
    }

    public Optional<OrderDto> findById(UUID id) {
        return repository.findById(id).map(OrderService::toDto);
    }

    public long count() {
        return repository.count();
    }

    private static OrderDto toDto(OrderEntity e) {
        return new OrderDto(
                e.id(),
                e.userId(),
                e.centerId(),
                e.fleetVehicleId(),
                e.status(),
                e.vehicleTypeChosen(),
                e.pickupSummary(),
                e.dropoffSummary(),
                e.handoffPin(),
                e.estimatedMinutes(),
                e.totalAmount(),
                e.currency(),
                e.simLatitude(),
                e.simLongitude(),
                e.simHeadingDeg(),
                e.simUpdatedAt(),
                e.planSnapshot() == null ? null : e.planSnapshot().value(),
                e.trackingState() == null ? null : e.trackingState().value(),
                e.createdAt(),
                e.updatedAt(),
                e.version(),
                e.metadata() == null ? null : e.metadata().value()
        );
    }
}
