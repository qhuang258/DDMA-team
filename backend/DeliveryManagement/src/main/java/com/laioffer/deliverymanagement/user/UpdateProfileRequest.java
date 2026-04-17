package com.laioffer.deliverymanagement.user;

/**
 * F8
 * Request body for PUT /api/v1/users/me.
 * Only fullName and phone are mutable; email is intentionally excluded
 * so the backend never overwrites it even if the client sends it.
 */
public record UpdateProfileRequest(
        String fullName,
        String phone
) {
}
