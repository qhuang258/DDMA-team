package com.laioffer.deliverymanagement.service;

import com.laioffer.deliverymanagement.dto.OrderParcelDto;
import com.laioffer.deliverymanagement.entity.OrderParcelEntity;
import com.laioffer.deliverymanagement.repository.OrderParcelRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderParcelService {

    private final OrderParcelRepository repository;

    public OrderParcelService(OrderParcelRepository repository) {
        this.repository = repository;
    }

    public List<OrderParcelDto> findAll() {
        return repository.findAll().stream().map(OrderParcelService::toDto).toList();
    }

    public Optional<OrderParcelDto> findByOrderId(UUID orderId) {
        return repository.findByOrderId(orderId).map(OrderParcelService::toDto);
    }

    public Optional<OrderParcelDto> findById(UUID id) {
        return repository.findById(id).map(OrderParcelService::toDto);
    }

    public long count() {
        return repository.count();
    }

    private static OrderParcelDto toDto(OrderParcelEntity e) {
        return new OrderParcelDto(
                e.id(),
                e.orderId(),
                e.sizeTier(),
                e.weightKg(),
                e.fragile(),
                e.deliveryNotes(),
                e.dimensions() == null ? null : e.dimensions().value(),
                e.metadata() == null ? null : e.metadata().value()
        );
    }
}
