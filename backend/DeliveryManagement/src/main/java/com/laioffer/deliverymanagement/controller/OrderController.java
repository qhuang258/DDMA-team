package com.laioffer.deliverymanagement.controller;

import com.laioffer.deliverymanagement.api.ApiException;
import com.laioffer.deliverymanagement.auth.AuthenticatedUser;
import com.laioffer.deliverymanagement.dto.OrderDto;
import com.laioffer.deliverymanagement.dto.OrderParcelDto;
import com.laioffer.deliverymanagement.service.DeliveryCenterService;
import com.laioffer.deliverymanagement.service.OrderParcelService;
import com.laioffer.deliverymanagement.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderParcelService orderParcelService;
    private final DeliveryCenterService deliveryCenterService;

    public OrderController(
            OrderService orderService,
            OrderParcelService orderParcelService,
            DeliveryCenterService deliveryCenterService
    ) {
        this.orderService = orderService;
        this.orderParcelService = orderParcelService;
        this.deliveryCenterService = deliveryCenterService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateOrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        AuthenticatedUser user = requireAuthenticatedUser();
        if (deliveryCenterService.findById(request.centerId()).isEmpty()) {
            throw new ApiException(404, "CENTER_NOT_FOUND", "Delivery center not found.");
        }

        OrderDto order = orderService.createOrder(
                user.id(),
                request.centerId(),
                request.pickupAddress(),
                request.dropoffAddress()
        );
        return new CreateOrderResponse(order.id(), order.status(), order.createdAt());
    }

    @PostMapping("/{orderId}/parcels")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateParcelResponse addParcel(
            @PathVariable UUID orderId,
            @Valid @RequestBody CreateParcelRequest request
    ) {
        AuthenticatedUser user = requireAuthenticatedUser();
        OrderDto order = orderService.findById(orderId)
                .orElseThrow(() -> new ApiException(404, "ORDER_NOT_FOUND", "Order not found."));

        if (!user.id().equals(order.userId())) {
            throw new ApiException(403, "ORDER_FORBIDDEN", "Order does not belong to the authenticated user.");
        }

        OrderParcelDto parcel = orderParcelService.createParcel(
                orderId,
                request.sizeTier(),
                request.weightKg(),
                request.fragile(),
                request.deliveryNotes()
        );
        return new CreateParcelResponse(parcel.id(), parcel.orderId(), parcel.sizeTier(), parcel.weightKg());
    }

    private AuthenticatedUser requireAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new ApiException(401, "TOKEN_MISSING", "Authorization header with Bearer token is required.");
        }
        return user;
    }
}
