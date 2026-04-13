package com.laioffer.deliverymanagement.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @JsonProperty("email") String email,
        @JsonProperty("phone") String phone,
        @JsonProperty("password") @NotBlank String password,
        @JsonProperty("full_name") String fullName
) {
}
