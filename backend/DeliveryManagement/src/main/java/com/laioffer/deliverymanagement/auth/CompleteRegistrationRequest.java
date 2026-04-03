package com.laioffer.deliverymanagement.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CompleteRegistrationRequest(
        @JsonProperty("challenge_id") @NotNull UUID challengeId,
        @JsonProperty("otp_code") @NotBlank String otpCode
) {
}
