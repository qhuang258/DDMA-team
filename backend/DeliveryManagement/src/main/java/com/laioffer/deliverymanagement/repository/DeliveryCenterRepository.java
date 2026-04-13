package com.laioffer.deliverymanagement.repository;

import com.laioffer.deliverymanagement.entity.DeliveryCenterEntity;
import org.springframework.data.repository.ListCrudRepository;

import java.util.UUID;

public interface DeliveryCenterRepository extends ListCrudRepository<DeliveryCenterEntity, UUID> {
}
