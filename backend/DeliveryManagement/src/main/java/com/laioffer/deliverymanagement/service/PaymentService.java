package com.laioffer.deliverymanagement.service;

import com.laioffer.deliverymanagement.dto.PaymentDto;
import com.laioffer.deliverymanagement.entity.PaymentEntity;
import com.laioffer.deliverymanagement.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository repository;

    public PaymentService(PaymentRepository repository) {
        this.repository = repository;
    }

    public List<PaymentDto> findAll() {
        return repository.findAll().stream().map(PaymentService::toDto).toList();
    }

    public Optional<PaymentDto> findByOrderId(UUID orderId) {
        return repository.findByOrderId(orderId).map(PaymentService::toDto);
    }

    public Optional<PaymentDto> findById(UUID id) {
        return repository.findById(id).map(PaymentService::toDto);
    }

    public long count() {
        return repository.count();
    }

    private static PaymentDto toDto(PaymentEntity e) {
        return new PaymentDto(
                e.id(),
                e.orderId(),
                e.stripePaymentIntentId(),
                e.status(),
                e.amount(),
                e.currency(),
                e.idempotencyKey(),
                e.createdAt(),
                e.updatedAt(),
                e.providerPayload() == null ? null : e.providerPayload().value()
        );
    }
}
