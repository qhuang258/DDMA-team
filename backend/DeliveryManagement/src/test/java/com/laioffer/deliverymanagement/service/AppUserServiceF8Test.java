package com.laioffer.deliverymanagement.service;

import com.laioffer.deliverymanagement.dto.AppUserDto;
import com.laioffer.deliverymanagement.entity.AppUserEntity;
import com.laioffer.deliverymanagement.repository.AppUserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * F8 unit tests
 *
 * Tests AppUserService.updateProfile() in isolation using Mockito mocks.
 * No database or Spring context is needed — these run instantly.
 *
 * Run with:  ./gradlew test --tests "*.AppUserServiceF8Test"
 */
@ExtendWith(MockitoExtension.class)
class AppUserServiceF8Test {

    @Mock
    AppUserRepository repository;

    @InjectMocks
    AppUserService service;

    // ── helpers ──────────────────────────────────────────────────────────────

    private AppUserEntity makeEntity(UUID id, String email, String fullName, String phone) {
        return new AppUserEntity(
                id, email, phone, "hashed-pw", fullName,
                false, OffsetDateTime.now(), OffsetDateTime.now(), 1, null
        );
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateProfile: calls repository with new fullName and phone")
    void updateProfile_delegatesToRepository() {
        UUID id = UUID.randomUUID();
        AppUserEntity updated = makeEntity(id, "alice@example.com", "Alice Wang", "+14155551234");
        when(repository.findById(id)).thenReturn(Optional.of(updated));

        service.updateProfile(id, "Alice Wang", "+14155551234");

        // Verify the modifying query was actually invoked with the right args
        verify(repository, times(1)).updateProfile(id, "Alice Wang", "+14155551234");
    }

    @Test
    @DisplayName("updateProfile: returned DTO reflects the new fullName and phone")
    void updateProfile_returnsDtoWithUpdatedFields() {
        UUID id = UUID.randomUUID();
        AppUserEntity updatedEntity = makeEntity(id, "alice@example.com", "Alice Wang", "+14155551234");
        when(repository.findById(id)).thenReturn(Optional.of(updatedEntity));

        Optional<AppUserDto> result = service.updateProfile(id, "Alice Wang", "+14155551234");

        assertThat(result).isPresent();
        assertThat(result.get().fullName()).isEqualTo("Alice Wang");
        assertThat(result.get().phone()).isEqualTo("+14155551234");
    }

    @Test
    @DisplayName("updateProfile: email is never changed (immutable by design)")
    void updateProfile_doesNotChangeEmail() {
        UUID id = UUID.randomUUID();
        String originalEmail = "alice@example.com";
        AppUserEntity updatedEntity = makeEntity(id, originalEmail, "Alice Wang", "+1");
        when(repository.findById(id)).thenReturn(Optional.of(updatedEntity));

        Optional<AppUserDto> result = service.updateProfile(id, "Alice Wang", "+1");

        assertThat(result).isPresent();
        assertThat(result.get().email()).isEqualTo(originalEmail);

        // Extra safety: make sure the repository's updateProfile() is never
        // called with an email parameter (the method signature doesn't even accept one)
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("updateProfile: returns empty Optional when user does not exist")
    void updateProfile_returnsEmpty_whenUserNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        Optional<AppUserDto> result = service.updateProfile(id, "Ghost", "+0");

        assertThat(result).isEmpty();
        // The @Modifying query still runs; the re-fetch simply returns empty
        verify(repository, times(1)).updateProfile(id, "Ghost", "+0");
    }

    @Test
    @DisplayName("updateProfile: null fullName and phone are passed through as-is")
    void updateProfile_allowsNullFields() {
        UUID id = UUID.randomUUID();
        AppUserEntity entity = makeEntity(id, "alice@example.com", null, null);
        when(repository.findById(id)).thenReturn(Optional.of(entity));

        Optional<AppUserDto> result = service.updateProfile(id, null, null);

        verify(repository).updateProfile(id, null, null);
        assertThat(result).isPresent();
        assertThat(result.get().fullName()).isNull();
        assertThat(result.get().phone()).isNull();
    }
}
