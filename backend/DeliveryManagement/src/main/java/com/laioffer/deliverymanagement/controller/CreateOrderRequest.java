package com.laioffer.deliverymanagement.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateOrderRequest(
        @NotNull UUID centerId,
        @NotBlank String pickupAddress,
        BigDecimal pickupLat,
        BigDecimal pickupLng,
        @NotBlank String dropoffAddress,
        BigDecimal dropoffLat,
        BigDecimal dropoffLng
) {
}
