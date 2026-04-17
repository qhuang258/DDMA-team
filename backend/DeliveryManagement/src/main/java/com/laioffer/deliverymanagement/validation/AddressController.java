package com.laioffer.deliverymanagement.validation;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/validate")
public class AddressController {

    private final AddressValidationService service;

    public AddressController(AddressValidationService service) {
        this.service = service;
    }

    // POST /api/v1/validate/address
    // Public endpoint — no JWT required (validation happens before order creation)
    @PostMapping("/address")
    public AddressValidateResponse validateAddress(@Valid @RequestBody AddressValidateRequest req) {
        return service.validate(req);
    }
}
