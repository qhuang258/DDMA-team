package com.laioffer.deliverymanagement.validation;

import org.springframework.stereotype.Service;

@Service
public class AddressValidationService {

    // SF service area — simple bounding rectangle covering the main city
    // Vertices listed counter-clockwise: NW → NE → SE → SW
    private static final double[][] SF_POLYGON = {
            {37.8120, -122.5150}, // NW
            {37.8120, -122.3550}, // NE
            {37.7080, -122.3550}, // SE
            {37.7080, -122.5150}  // SW
    };

    // SF zip codes and keywords used when lat/lng are not provided
    private static final String[] SF_KEYWORDS = {
            "san francisco", "sf, ca", "sf,ca",
            "94102", "94103", "94104", "94105", "94107", "94108", "94109",
            "94110", "94111", "94112", "94114", "94115", "94116", "94117",
            "94118", "94121", "94122", "94123", "94124", "94127", "94129",
            "94130", "94131", "94132", "94133", "94134"
    };

    public AddressValidateResponse validate(AddressValidateRequest req) {
        // Prefer coordinate-based check when lat/lng are provided
        if (req.lat() != null && req.lng() != null) {
            boolean inZone = isInsidePolygon(req.lat(), req.lng());
            return inZone
                    ? new AddressValidateResponse(true, "Address is within the service area")
                    : new AddressValidateResponse(false, "Address is outside our San Francisco service area");
        }

        // Fallback: keyword search in the address string
        String lower = req.address().toLowerCase();
        for (String keyword : SF_KEYWORDS) {
            if (lower.contains(keyword)) {
                return new AddressValidateResponse(true, "Address is within the service area");
            }
        }
        return new AddressValidateResponse(false, "Address is outside our San Francisco service area");
    }

    // Ray-casting algorithm: cast a horizontal ray from (lat, lng) to the right
    // and count edge crossings. Odd count = inside the polygon.
    private boolean isInsidePolygon(double lat, double lng) {
        int n = SF_POLYGON.length;
        boolean inside = false;
        for (int i = 0, j = n - 1; i < n; j = i++) {
            double latI = SF_POLYGON[i][0], lngI = SF_POLYGON[i][1];
            double latJ = SF_POLYGON[j][0], lngJ = SF_POLYGON[j][1];
            // Check if the ray crosses this edge
            boolean crosses = ((latI > lat) != (latJ > lat))
                    && (lng < (lngJ - lngI) * (lat - latI) / (latJ - latI) + lngI);
            if (crosses) inside = !inside;
        }
        return inside;
    }
}
