package com.laioffer.deliverymanagement.repository;

import com.laioffer.deliverymanagement.entity.OrderEntity;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends ListCrudRepository<OrderEntity, UUID> {

    List<OrderEntity> findByUserId(UUID userId);
}
