package com.laioffer.deliverymanagement.controller;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateOrderResponse(
        UUID orderId,
        String status,
        OffsetDateTime createdAt
) {
}
