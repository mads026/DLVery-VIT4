package com.dlvery.dlvery.service;

import com.dlvery.dlvery.dto.AuthResponse;
import com.dlvery.dlvery.dto.LoginRequest;
import com.dlvery.dlvery.dto.RegisterRequest;
import com.dlvery.dlvery.entity.AuthProvider;
import com.dlvery.dlvery.entity.User;
import com.dlvery.dlvery.entity.UserRole;
import com.dlvery.dlvery.exception.CustomExceptions;
import com.dlvery.dlvery.repository.UserRepository;
import com.dlvery.dlvery.util.JwtUtil;
import com.dlvery.dlvery.util.PasswordValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailVerificationService emailVerificationService;
    private final PasswordValidator passwordValidator;
    
    public AuthResponse authenticateInventoryTeam(LoginRequest loginRequest) {
        User user = authenticateAndValidateUser(loginRequest, UserRole.INV_TEAM);
        return createAuthResponse(user, "Login successful");
    }

    private User authenticateAndValidateUser(LoginRequest loginRequest, UserRole requiredRole) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            User user = (User) authentication.getPrincipal();
            validateUserAccess(user, requiredRole);
            updateUserLogin(user);

            return user;

        } catch (AuthenticationException e) {
            throw new CustomExceptions.AuthenticationFailedException("Invalid credentials");
        }
    }

    private void validateUserAccess(User user, UserRole requiredRole) {
        if (user.getRole() != requiredRole) {
            throw new CustomExceptions.InvalidRoleException("Access denied: Invalid role for this login");
        }

        if (!user.getEmailVerified()) {
            throw new CustomExceptions.EmailNotVerifiedException("Please verify your email before logging in");
        }
    }

    private void updateUserLogin(User user) {
        user.updateLastLogin();
        userService.save(user);
    }

    private AuthResponse createAuthResponse(User user, String message) {
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(
            token,
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            message
        );
    }
    
    public AuthResponse registerInventoryTeam(RegisterRequest registerRequest) {
        validateRegistrationRequest(registerRequest);
        User newUser = createNewUser(registerRequest);
        User savedUser = userRepository.save(newUser);

        emailVerificationService.sendVerificationEmail(savedUser);

        return new AuthResponse(
            null,
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole(),
            "Registration successful! Please check your email and verify your account before logging in."
        );
    }

    private void validateRegistrationRequest(RegisterRequest registerRequest) {
        validatePasswordRequirements(registerRequest);
        validateUserUniqueness(registerRequest);
    }

    private void validatePasswordRequirements(RegisterRequest registerRequest) {
        PasswordValidator.PasswordValidationResult passwordResult =
            passwordValidator.validatePassword(registerRequest.getPassword());

        if (!passwordResult.isValid()) {
            throw new CustomExceptions.InvalidPasswordException(passwordResult.getMessage());
        }

        PasswordValidator.PasswordValidationResult matchResult =
            passwordValidator.validatePasswordMatch(
                registerRequest.getPassword(),
                registerRequest.getConfirmPassword()
            );

        if (!matchResult.isValid()) {
            throw new CustomExceptions.InvalidPasswordException(matchResult.getMessage());
        }
    }

    private void validateUserUniqueness(RegisterRequest registerRequest) {
        String username = registerRequest.getUsername().trim();
        String email = registerRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new CustomExceptions.UserAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new CustomExceptions.UserAlreadyExistsException("Email already exists");
        }
    }

    private User createNewUser(RegisterRequest registerRequest) {
        User user = new User();
        user.setUsername(registerRequest.getUsername().trim());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail().trim().toLowerCase());
        user.setFullName(registerRequest.getFullName().trim());
        user.setRole(UserRole.INV_TEAM);
        user.setOauthProvider(AuthProvider.LOCAL);
        user.setIsActive(true);
        user.setEmailVerified(false);

        return user;
    }

}