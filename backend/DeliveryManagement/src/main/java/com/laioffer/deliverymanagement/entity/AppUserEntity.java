package com.laioffer.deliverymanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Table("app_user")
public record AppUserEntity(
        @Id UUID id,
        String email,
        String phone,
        String passwordHash,
        String fullName,
        boolean guest,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        @Version int version,
        Jsonb metadata
) implements Persistable<UUID> {

    @Override
    public UUID getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return id == null;
    }
}
