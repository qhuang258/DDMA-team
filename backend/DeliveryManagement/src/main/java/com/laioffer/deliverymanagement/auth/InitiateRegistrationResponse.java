package com.laioffer.deliverymanagement.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public record InitiateRegistrationResponse(
        @JsonProperty("challenge_id") UUID challengeId,
        @JsonProperty("otp_code") String otpCode,
        String message
) {
}
