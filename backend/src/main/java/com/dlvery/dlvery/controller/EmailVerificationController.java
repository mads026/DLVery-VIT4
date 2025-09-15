package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class EmailVerificationController {
    
    private final EmailVerificationService emailVerificationService;
    
    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;
    
    @GetMapping("/verify-email")
    public void verifyEmail(HttpServletResponse response, @RequestParam String token) throws IOException {
        try {
            System.out.println("Received verification token: " + token);
            boolean verified = emailVerificationService.verifyEmail(token);
            
            if (verified) {
                // Redirect to frontend login page with success parameter
                String redirectUrl = frontendUrl + "/login?verified=true";
                response.sendRedirect(redirectUrl);
            } else {
                // Redirect to frontend login page with error parameter
                String redirectUrl = frontendUrl + "/login?error=invalid_token";
                response.sendRedirect(redirectUrl);
            }
        } catch (Exception e) {
            System.out.println("Verification error: " + e.getMessage());
            e.printStackTrace();
            // Redirect to frontend login page with error parameter
            String redirectUrl = frontendUrl + "/login?error=verification_failed";
            response.sendRedirect(redirectUrl);
        }
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email is required"
                ));
            }
            
            emailVerificationService.resendVerificationEmail(email.trim());
            
            // Properly encode the success message
            String encodedMessage = URLEncoder.encode("Verification email sent successfully! Please check your inbox.", StandardCharsets.UTF_8);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", encodedMessage
            ));
            
        } catch (Exception e) {
            // Properly encode the error message
            String encodedErrorMessage = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", encodedErrorMessage
            ));
        }
    }
    
    // Debug endpoint - remove in production
    @GetMapping("/debug-user/{email}")
    public ResponseEntity<?> debugUser(@PathVariable String email) {
        try {
            var userOpt = emailVerificationService.findUserByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            var user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "emailVerified", user.getEmailVerified(),
                "verificationToken", user.getVerificationToken() != null ? "Present" : "Null",
                "tokenExpires", user.getVerificationTokenExpiresAt() != null ? user.getVerificationTokenExpiresAt().toString() : "Null"
            ));
        } catch (Exception e) {
            // Properly encode the error message
            String encodedErrorMessage = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            return ResponseEntity.badRequest().body(Map.of(
                "error", encodedErrorMessage
            ));
        }
    }
}