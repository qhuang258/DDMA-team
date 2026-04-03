package com.laioffer.deliverymanagement.auth;

import java.util.UUID;

public record AuthenticatedUser(
        UUID id,
        String email,
        String phone,
        boolean guest
) {
}
