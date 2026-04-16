package com.laioffer.deliverymanagement.controller;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record CreateParcelRequest(
        @NotBlank
        @Pattern(regexp = "S|M|L")
        String sizeTier,
        @NotNull
        @DecimalMin("0.001")
        BigDecimal weightKg,
        boolean fragile,
        String deliveryNotes
) {
}
