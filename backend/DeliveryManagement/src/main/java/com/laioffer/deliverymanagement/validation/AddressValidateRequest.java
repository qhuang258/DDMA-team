package com.laioffer.deliverymanagement.validation;

import jakarta.validation.constraints.NotBlank;

// Request body for POST /api/v1/validate/address
// lat/lng are optional — if provided, ray-casting is used for precise check.
// If omitted, falls back to SF keyword matching (until Google Maps is wired up).
public record AddressValidateRequest(
        @NotBlank String address,
        Double lat,
        Double lng
) {}
