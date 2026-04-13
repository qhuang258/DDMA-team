package com.laioffer.deliverymanagement.repository;

import com.laioffer.deliverymanagement.entity.OtpChallengeEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OtpChallengeRepository extends ListCrudRepository<OtpChallengeEntity, UUID> {

    List<OtpChallengeEntity> findByUserId(UUID userId);

    @Query("SELECT * FROM otp_challenge WHERE user_id = :userId ORDER BY created_at DESC, id DESC LIMIT 1")
    Optional<OtpChallengeEntity> findLatestByUserId(@Param("userId") UUID userId);

    @Query("""
            SELECT * FROM otp_challenge
            WHERE user_id = :userId
              AND consumed = FALSE
              AND expires_at > CURRENT_TIMESTAMP
            ORDER BY created_at DESC, id DESC
            LIMIT 1
            """)
    Optional<OtpChallengeEntity> findLatestActiveByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE otp_challenge SET attempt_count = attempt_count + 1 WHERE id = :id")
    void incrementAttemptCount(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE otp_challenge SET consumed = TRUE WHERE id = :id AND consumed = FALSE")
    int markConsumed(@Param("id") UUID id);
}
