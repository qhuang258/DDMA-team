package com.laioffer.deliverymanagement.service;

import com.laioffer.deliverymanagement.api.ApiException;
import com.laioffer.deliverymanagement.dto.OrderParcelDto;
import com.laioffer.deliverymanagement.entity.OrderParcelEntity;
import com.laioffer.deliverymanagement.repository.OrderParcelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    @Transactional
    public OrderParcelDto createParcel(
            UUID orderId,
            String sizeTier,
            BigDecimal weightKg,
            boolean fragile,
            String deliveryNotes
    ) {
        if (repository.findByOrderId(orderId).isPresent()) {
            throw new ApiException(409, "PARCEL_ALREADY_EXISTS", "A parcel already exists for this order.");
        }

        OrderParcelEntity saved = repository.save(new OrderParcelEntity(
                null,
                orderId,
                sizeTier,
                weightKg,
                fragile,
                normalizeText(deliveryNotes),
                null,
                null
        ));
        return toDto(saved);
    }

    public long count() {
        return repository.count();
    }

    private static String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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
