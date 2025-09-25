package com.dlvery.dlvery.service;

import com.dlvery.dlvery.entity.User;
import com.dlvery.dlvery.exception.CustomExceptions;
import com.dlvery.dlvery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {
    
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();
    
    @Transactional
    public void sendVerificationEmail(User user) {
        // Generate verification token
        String token = generateVerificationToken();
        
        // Set token and expiration (24 hours from now)
        user.setVerificationToken(token);
        user.setVerificationTokenExpiresAt(LocalDateTime.now().plusHours(24));
        
        // Save user with token
        userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(user);
        
        log.info("Verification email sent to user: {}", user.getEmail());
    }
    
    @Transactional
    public boolean verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token);
        
        if (user == null) {
            log.warn("Invalid verification token: {}", token);
            return false;
        }
        
        if (user.getVerificationTokenExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Expired verification token for user: {}", user.getEmail());
            return false;
        }
        
        // Mark email as verified
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        
        userRepository.save(user);
        
        // Send welcome email
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            log.warn("Failed to send welcome email: {}", e.getMessage());
        }
        
        log.info("Email verified successfully for user: {}", user.getEmail());
        return true;
    }
    
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        
        if (user.getEmailVerified()) {
            throw new CustomExceptions.EmailNotVerifiedException("Email is already verified");
        }
        
        sendVerificationEmail(user);
    }
    
    public boolean isVerificationTokenExpired(User user) {
        return user.getVerificationTokenExpiresAt() != null && 
               user.getVerificationTokenExpiresAt().isBefore(LocalDateTime.now());
    }
    
    private String generateVerificationToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
    
    // Debug method - remove in production
    public java.util.Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}