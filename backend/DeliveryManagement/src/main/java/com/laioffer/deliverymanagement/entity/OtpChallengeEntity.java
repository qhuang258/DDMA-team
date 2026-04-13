package com.laioffer.deliverymanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Table("otp_challenge")
public record OtpChallengeEntity(
        @Id UUID id,
        UUID userId,
        String channel,
        String codeHash,
        OffsetDateTime expiresAt,
        boolean consumed,
        short attemptCount,
        OffsetDateTime createdAt
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
