package com.laioffer.deliverymanagement.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SendOtpRequest(
        @NotBlank(message = "full_name is required")
        String full_name,

        @Email(message = "email must be valid")
        @NotBlank(message = "email is required")
        String email,

        @NotBlank(message = "password is required")
        String password,

        @Pattern(regexp = "EMAIL|SMS", message = "channel must be EMAIL or SMS")
        String channel
) {
}