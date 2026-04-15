package com.laioffer.deliverymanagement.validation;

// Response body for POST /api/v1/validate/address
public record AddressValidateResponse(boolean valid, String message) {}
