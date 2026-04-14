package com.laioffer.deliverymanagement.auth;

import com.laioffer.deliverymanagement.api.ApiException;
import com.laioffer.deliverymanagement.service.AppUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final AppUserService appUserService;

    public AuthController(AuthService authService, AppUserService appUserService) {
        this.authService = authService;
        this.appUserService = appUserService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public InitiateRegistrationResponse initiateRegistration(@Valid @RequestBody RegisterRequest request) {
        return authService.initiateRegistration(request);
    }

    @PostMapping("/register/complete")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationResponse completeRegistration(@Valid @RequestBody CompleteRegistrationRequest request) {
        return authService.completeRegistration(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AppUserSummary me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new ApiException(401, "TOKEN_MISSING", "Authorization header with Bearer token is required.");
        }
        return appUserService.findById(user.id())
                .map(u -> new AppUserSummary(u.id(), u.email(), u.phone(), u.fullName(), u.guest()))
                .orElseThrow(() -> new ApiException(401, "USER_NOT_FOUND", "Authenticated user no longer exists."));
    }
}
