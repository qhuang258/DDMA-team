package com.laioffer.deliverymanagement.auth;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.laioffer.deliverymanagement.api.ApiException;
import com.laioffer.deliverymanagement.dto.AppUserDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtService {

    private final byte[] secret;
    private final long expirationSeconds;
    private final ObjectMapper objectMapper;

    public JwtService(
            @Value("${app.auth.jwt-secret}") String secret,
            @Value("${app.auth.jwt-expiration-seconds}") long expirationSeconds,
            ObjectMapper objectMapper
    ) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationSeconds = expirationSeconds;
        this.objectMapper = objectMapper;
    }

    public String issueToken(AppUserDto user) {
        Instant now = Instant.now();
        String header = encodeJson(Map.of("alg", "HS256", "typ", "JWT"));

        Map<String, Object> payloadBody = new LinkedHashMap<>();
        payloadBody.put("sub", user.id().toString());
        payloadBody.put("email", user.email());
        payloadBody.put("phone", user.phone());
        payloadBody.put("guest", user.guest());
        payloadBody.put("iat", now.getEpochSecond());
        payloadBody.put("exp", now.plusSeconds(expirationSeconds).getEpochSecond());
        String payload = encodeJson(payloadBody);

        String signingInput = header + "." + payload;
        return signingInput + "." + sign(signingInput);
    }

    public AuthenticatedUser verifyToken(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new ApiException(401, "TOKEN_INVALID", "Invalid token.");
        }

        String signingInput = parts[0] + "." + parts[1];
        byte[] expected = sign(signingInput).getBytes(StandardCharsets.UTF_8);
        byte[] actual = parts[2].getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(expected, actual)) {
            throw new ApiException(401, "TOKEN_INVALID", "Invalid token.");
        }

        try {
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(payloadBytes, new TypeReference<>() {});

            long exp = ((Number) claims.get("exp")).longValue();
            if (Instant.now().getEpochSecond() > exp) {
                throw new ApiException(401, "TOKEN_EXPIRED", "Token has expired.");
            }

            return new AuthenticatedUser(
                    UUID.fromString((String) claims.get("sub")),
                    (String) claims.get("email"),
                    (String) claims.get("phone"),
                    (Boolean) claims.get("guest")
            );
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(401, "TOKEN_INVALID", "Invalid token.");
        }
    }

    public long expirationSeconds() {
        return expirationSeconds;
    }

    private String encodeJson(Map<String, Object> body) {
        StringBuilder builder = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : body.entrySet()) {
            if (!first) {
                builder.append(',');
            }
            builder.append('"').append(escapeJson(entry.getKey())).append('"').append(':');
            appendJsonValue(builder, entry.getValue());
            first = false;
        }
        builder.append('}');
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(builder.toString().getBytes(StandardCharsets.UTF_8));
    }

    private void appendJsonValue(StringBuilder builder, Object value) {
        if (value == null) {
            builder.append("null");
            return;
        }
        if (value instanceof Number || value instanceof Boolean) {
            builder.append(value);
            return;
        }
        builder.append('"').append(escapeJson(String.valueOf(value))).append('"');
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    private String sign(String signingInput) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            byte[] signature = mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to sign JWT", e);
        }
    }
}
