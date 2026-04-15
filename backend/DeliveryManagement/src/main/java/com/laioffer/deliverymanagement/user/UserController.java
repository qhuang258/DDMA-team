package com.laioffer.deliverymanagement.user;

import com.laioffer.deliverymanagement.api.ApiException;
import com.laioffer.deliverymanagement.auth.AppUserSummary;
import com.laioffer.deliverymanagement.auth.AuthenticatedUser;
import com.laioffer.deliverymanagement.service.AppUserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * F8 — created by Sida Xue.
 *
 * Handles user profile read and update via:
 *   GET /api/v1/users/me  — return current user's profile (same shape as /auth/me)
 *   PUT /api/v1/users/me  — update fullName and phone; email is intentionally immutable
 *
 * Auth is resolved from the Spring Security context populated by JwtAuthFilter,
 * following the same pattern used in AuthController.me().
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final AppUserService appUserService;

    public UserController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @GetMapping("/me")
    public AppUserSummary getMe() {
        AuthenticatedUser user = resolveAuthenticatedUser();
        return appUserService.findById(user.id())
                .map(u -> new AppUserSummary(u.id(), u.email(), u.phone(), u.fullName(), u.guest()))
                .orElseThrow(() -> new ApiException(401, "USER_NOT_FOUND", "Authenticated user no longer exists."));
    }

    @PutMapping("/me")
    public AppUserSummary updateProfile(@RequestBody UpdateProfileRequest req) {
        AuthenticatedUser user = resolveAuthenticatedUser();
        return appUserService.updateProfile(user.id(), req.fullName(), req.phone())
                .map(u -> new AppUserSummary(u.id(), u.email(), u.phone(), u.fullName(), u.guest()))
                .orElseThrow(() -> new ApiException(404, "USER_NOT_FOUND", "User not found."));
    }

    // Extracts AuthenticatedUser from the SecurityContext set by JwtAuthFilter.
    // Returns 401 if no valid JWT was present on the request.
    private AuthenticatedUser resolveAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new ApiException(401, "TOKEN_MISSING", "Authorization header with Bearer token is required.");
        }
        return user;
    }
}
