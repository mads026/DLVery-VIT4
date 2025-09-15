package com.dlvery.dlvery.service;

import com.dlvery.dlvery.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendVerificationEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Verify Your Email - Dlvery Platform");
            
            // Use UriComponentsBuilder to properly construct and encode the verification URL
            String verificationUrl = UriComponentsBuilder.fromUriString("http://localhost:8080")
                .path("/api/auth/verify-email")
                .queryParam("token", user.getVerificationToken())
                .build()
                .toUriString();
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Thank you for registering with Dlvery Platform!\n\n" +
                "Please click the link below to verify your email address:\n" +
                "%s\n\n" +
                "This verification link will expire in 24 hours.\n\n" +
                "If you didn't create an account with us, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Dlvery Team\n\n" +
                "Note: This link will show a JSON response confirming verification.",
                user.getFullName() != null ? user.getFullName() : user.getUsername(),
                verificationUrl
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("Verification email sent successfully to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send verification email");
        }
    }
    
    public void sendWelcomeEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Welcome to Dlvery Platform!");
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Welcome to Dlvery Platform! Your email has been successfully verified.\n\n" +
                "You can now access your %s dashboard at: %s\n\n" +
                "If you have any questions, please don't hesitate to contact our support team.\n\n" +
                "Best regards,\n" +
                "Dlvery Team",
                user.getFullName() != null ? user.getFullName() : user.getUsername(),
                user.getRole().name().equals("INV_TEAM") ? "Inventory" : "Delivery",
                frontendUrl
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("Welcome email sent successfully to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", user.getEmail(), e);
            // Don't throw exception for welcome email failure
        }
    }
}