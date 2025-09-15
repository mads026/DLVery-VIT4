package com.dlvery.dlvery.service;

import com.dlvery.dlvery.dto.AuthResponse;
import com.dlvery.dlvery.dto.LoginRequest;
import com.dlvery.dlvery.dto.RegisterRequest;
import com.dlvery.dlvery.entity.AuthProvider;
import com.dlvery.dlvery.entity.User;
import com.dlvery.dlvery.entity.UserRole;
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
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), 
                    loginRequest.getPassword()
                )
            );
            
            User user = (User) authentication.getPrincipal();
            
            // Verify user is inventory team
            if (user.getRole() != UserRole.INV_TEAM) {
                throw new RuntimeException("Access denied: Invalid role for inventory login");
            }
            
            // Check if email is verified
            if (!user.getEmailVerified()) {
                throw new RuntimeException("Please verify your email before logging in. Check your inbox for verification link.");
            }
            
            // Update last login time
            user.updateLastLogin();
            userService.save(user);
            
            String token = jwtUtil.generateToken(user);
            
            return new AuthResponse(
                token,
                user.getUsername(),
                user.getUsername(), // Using username as email for response
                user.getRole(),
                "Login successful"
            );
            
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid credentials");
        }
    }
    
    public AuthResponse registerInventoryTeam(RegisterRequest registerRequest) {
        // Validation
        if (registerRequest.getUsername() == null || registerRequest.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        
        // Use the PasswordValidator for comprehensive password validation
        PasswordValidator.PasswordValidationResult passwordValidationResult = 
            passwordValidator.validatePassword(registerRequest.getPassword());
        
        if (!passwordValidationResult.isValid()) {
            throw new RuntimeException(passwordValidationResult.getMessage());
        }
        
        PasswordValidator.PasswordValidationResult matchValidationResult = 
            passwordValidator.validatePasswordMatch(registerRequest.getPassword(), registerRequest.getConfirmPassword());
        
        if (!matchValidationResult.isValid()) {
            throw new RuntimeException(matchValidationResult.getMessage());
        }
        
        if (registerRequest.getEmail() == null || !isValidEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Valid email is required");
        }
        
        if (registerRequest.getFullName() == null || registerRequest.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full name is required");
        }
        
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername().trim())) {
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail().trim().toLowerCase())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Create new user
        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername().trim());
        newUser.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setEmail(registerRequest.getEmail().trim().toLowerCase());
        newUser.setFullName(registerRequest.getFullName().trim());
        newUser.setRole(UserRole.INV_TEAM);
        newUser.setOauthProvider(AuthProvider.LOCAL);
        newUser.setIsActive(true);
        newUser.setEmailVerified(false); // Email verification will be handled separately
        
        User savedUser = userRepository.save(newUser);
        
        // Send verification email
        emailVerificationService.sendVerificationEmail(savedUser);
        
        return new AuthResponse(
            null, // No token until email is verified
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole(),
            "Registration successful! Please check your email and verify your account before logging in."
        );
    }
    
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }
}