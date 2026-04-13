package com.laioffer.deliverymanagement.service;

import com.laioffer.deliverymanagement.dto.AppUserDto;
import com.laioffer.deliverymanagement.entity.AppUserEntity;
import com.laioffer.deliverymanagement.entity.Jsonb;
import com.laioffer.deliverymanagement.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AppUserService {

    private final AppUserRepository repository;

    public AppUserService(AppUserRepository repository) {
        this.repository = repository;
    }

    public List<AppUserDto> findAll() {
        return repository.findAll().stream().map(AppUserService::toDto).toList();
    }

    public Optional<AppUserDto> findById(UUID id) {
        return repository.findById(id).map(AppUserService::toDto);
    }

    public Optional<AppUserDto> findByEmail(String email) {
        return repository.findByEmail(email).map(AppUserService::toDto);
    }

    public Optional<AppUserDto> findByPhone(String phone) {
        return repository.findByPhone(phone).map(AppUserService::toDto);
    }

    public Optional<AppUserDto> findByEmailOrPhone(String identifier) {
        return repository.findByEmailOrPhone(identifier).map(AppUserService::toDto);
    }

    @Transactional
    public AppUserDto createUser(
            String email,
            String phone,
            String passwordHash,
            String fullName,
            boolean guest,
            String metadata
    ) {
        OffsetDateTime now = OffsetDateTime.now();
        AppUserEntity saved = repository.save(
                new AppUserEntity(null, email, phone, passwordHash, fullName,
                        guest, now, now, 0, Jsonb.of(metadata))
        );
        return toDto(saved);
    }

    @Transactional
    public Optional<AppUserDto> activateUser(UUID id) {
        repository.activateUser(id);
        return repository.findById(id).map(AppUserService::toDto);
    }

    public long count() {
        return repository.count();
    }

    private static AppUserDto toDto(AppUserEntity e) {
        return new AppUserDto(
                e.id(),
                e.email(),
                e.phone(),
                e.passwordHash(),
                e.fullName(),
                e.guest(),
                e.createdAt(),
                e.updatedAt(),
                e.version(),
                e.metadata() == null ? null : e.metadata().value()
        );
    }
}
