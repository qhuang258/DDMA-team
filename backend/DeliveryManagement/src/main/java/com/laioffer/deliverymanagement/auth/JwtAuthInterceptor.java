package com.laioffer.deliverymanagement.auth;

import com.laioffer.deliverymanagement.api.ApiErrorResponse;
import com.laioffer.deliverymanagement.api.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import tools.jackson.databind.ObjectMapper;

// Replaced by JwtAuthFilter (Spring Security OncePerRequestFilter).
// @Component removed so Spring no longer picks this up.
public class JwtAuthInterceptor implements HandlerInterceptor {

    static final String ATTR = "authenticatedUser";

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    public JwtAuthInterceptor(JwtService jwtService, ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            sendError(response, 401, "TOKEN_MISSING", "Authorization header with Bearer token is required.");
            return false;
        }

        String token = header.substring(7);
        try {
            AuthenticatedUser user = jwtService.verifyToken(token);
            request.setAttribute(ATTR, user);
            return true;
        } catch (ApiException e) {
            sendError(response, e.status(), e.code(), e.getMessage());
            return false;
        }
    }

    private void sendError(HttpServletResponse response, int status, String code, String message) throws Exception {
        response.setStatus(status);
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(), new ApiErrorResponse(code, message));
    }
}
