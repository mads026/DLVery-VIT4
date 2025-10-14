package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.dto.ChangePasswordRequest;
import com.dlvery.dlvery.dto.InventoryProfileDto;
import com.dlvery.dlvery.dto.UpdateInventoryProfileRequest;
import com.dlvery.dlvery.entity.User;
import com.dlvery.dlvery.entity.UserRole;
import com.dlvery.dlvery.exception.CustomExceptions;
import com.dlvery.dlvery.repository.UserRepository;
import com.dlvery.dlvery.util.PasswordValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INV_TEAM')")
public class InventoryProfileController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidator passwordValidator;
    
    @GetMapping
    public ResponseEntity<InventoryProfileDto> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        
        if (user.getRole() != UserRole.INV_TEAM) {
            throw new CustomExceptions.UnauthorizedException("Access denied");
        }
        
        InventoryProfileDto profile = new InventoryProfileDto(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getLastLoginAt(),
            user.getCreatedAt()
        );
        
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping
    public ResponseEntity<InventoryProfileDto> updateProfile(
            @Valid @RequestBody UpdateInventoryProfileRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        
        if (user.getRole() != UserRole.INV_TEAM) {
            throw new CustomExceptions.UnauthorizedException("Access denied");
        }
        
        // Check if email is being changed and if it's already taken
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new CustomExceptions.DuplicateResourceException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        
        user.setFullName(request.getFullName());
        User updatedUser = userRepository.save(user);
        
        InventoryProfileDto profile = new InventoryProfileDto(
            updatedUser.getId(),
            updatedUser.getUsername(),
            updatedUser.getEmail(),
            updatedUser.getFullName(),
            updatedUser.getLastLoginAt(),
            updatedUser.getCreatedAt()
        );
        
        return ResponseEntity.ok(profile);
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        
        if (user.getRole() != UserRole.INV_TEAM) {
            throw new CustomExceptions.UnauthorizedException("Access denied");
        }
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new CustomExceptions.AuthenticationFailedException("Current password is incorrect");
        }
        
        // Validate new password
        PasswordValidator.PasswordValidationResult validationResult = 
            passwordValidator.validatePassword(request.getNewPassword());
        
        if (!validationResult.isValid()) {
            throw new CustomExceptions.InvalidPasswordException(validationResult.getMessage());
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        
        return ResponseEntity.ok(response);
    }
}
