package com.laioffer.deliverymanagement.repository;

import com.laioffer.deliverymanagement.entity.OrderParcelEntity;
import org.springframework.data.repository.ListCrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderParcelRepository extends ListCrudRepository<OrderParcelEntity, UUID> {

    Optional<OrderParcelEntity> findByOrderId(UUID orderId);
}
