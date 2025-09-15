package com.dlvery.dlvery.service;

import com.dlvery.dlvery.entity.User;
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
        System.out.println("Looking for user with token: " + token);
        User user = userRepository.findByVerificationToken(token);
        
        if (user == null) {
            System.out.println("No user found with token: " + token);
            log.warn("Invalid verification token: {}", token);
            return false;
        }
        
        System.out.println("Found user: " + user.getEmail() + ", token expires at: " + user.getVerificationTokenExpiresAt());
        
        if (user.getVerificationTokenExpiresAt().isBefore(LocalDateTime.now())) {
            System.out.println("Token expired for user: " + user.getEmail());
            log.warn("Expired verification token for user: {}", user.getEmail());
            return false;
        }
        
        System.out.println("Updating user verification status for: " + user.getEmail());
        
        // Mark email as verified
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        
        User savedUser = userRepository.save(user);
        System.out.println("User saved with email_verified: " + savedUser.getEmailVerified());
        
        // Send welcome email
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            System.out.println("Failed to send welcome email: " + e.getMessage());
        }
        
        log.info("Email verified successfully for user: {}", user.getEmail());
        return true;
    }
    
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email is already verified");
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