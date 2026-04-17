package com.laioffer.deliverymanagement.repository;

import com.laioffer.deliverymanagement.entity.AppUserEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends ListCrudRepository<AppUserEntity, UUID> {

    Optional<AppUserEntity> findByEmail(String email);

    Optional<AppUserEntity> findByPhone(String phone);

    @Query("SELECT * FROM app_user WHERE email = :id OR phone = :id ORDER BY created_at, id LIMIT 1")
    Optional<AppUserEntity> findByEmailOrPhone(@Param("id") String identifier);

    @Modifying
    @Query("UPDATE app_user SET guest = false, updated_at = CURRENT_TIMESTAMP, version = version + 1 WHERE id = :id")
    void activateUser(@Param("id") UUID id);

    // F8
    // Updates fullName and phone for the given user.
    // Email is intentionally excluded — the backend never allows email changes.
    @Modifying
    @Query("UPDATE app_user SET full_name = :fullName, phone = :phone, updated_at = CURRENT_TIMESTAMP, version = version + 1 WHERE id = :id")
    void updateProfile(@Param("id") UUID id, @Param("fullName") String fullName, @Param("phone") String phone);
}
