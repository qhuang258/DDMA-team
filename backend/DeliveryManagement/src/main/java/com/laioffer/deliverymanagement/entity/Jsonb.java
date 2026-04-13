package com.laioffer.deliverymanagement.entity;

public record Jsonb(String value) {
    public static Jsonb of(String json) {
        return json == null ? null : new Jsonb(json);
    }
}
