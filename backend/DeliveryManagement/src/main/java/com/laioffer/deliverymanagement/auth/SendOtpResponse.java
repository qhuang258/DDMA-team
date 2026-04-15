package com.laioffer.deliverymanagement.auth;

import java.util.UUID;

public record SendOtpResponse(
        UUID challenge_id,
        String message
) {
}