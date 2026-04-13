package com.laioffer.deliverymanagement.service;

import com.laioffer.deliverymanagement.dto.DeliveryCenterDto;
import com.laioffer.deliverymanagement.entity.DeliveryCenterEntity;
import com.laioffer.deliverymanagement.repository.DeliveryCenterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DeliveryCenterService {

    private final DeliveryCenterRepository repository;

    public DeliveryCenterService(DeliveryCenterRepository repository) {
        this.repository = repository;
    }

    public List<DeliveryCenterDto> findAll() {
        return repository.findAll().stream().map(DeliveryCenterService::toDto).toList();
    }

    public Optional<DeliveryCenterDto> findById(UUID id) {
        return repository.findById(id).map(DeliveryCenterService::toDto);
    }

    public long count() {
        return repository.count();
    }

    private static DeliveryCenterDto toDto(DeliveryCenterEntity e) {
        return new DeliveryCenterDto(
                e.id(),
                e.name(),
                e.latitude(),
                e.longitude(),
                e.addressLine(),
                e.serviceAreaGeo() == null ? null : e.serviceAreaGeo().value(),
                e.metadata() == null ? null : e.metadata().value()
        );
    }
}
