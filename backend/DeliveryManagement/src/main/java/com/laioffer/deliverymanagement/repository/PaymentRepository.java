package com.laioffer.deliverymanagement.repository;

import com.laioffer.deliverymanagement.entity.PaymentEntity;
import org.springframework.data.repository.ListCrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends ListCrudRepository<PaymentEntity, UUID> {

    Optional<PaymentEntity> findByOrderId(UUID orderId);
}
