package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.dto.ResendVerificationRequest;
import com.dlvery.dlvery.service.EmailVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Email Verification", description = "Email verification endpoints")
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    private String buildRedirectUrl(String path, String param, String value) {
        return frontendUrl + path + "?" + param + "=" + value;
    }
    
    @GetMapping("/verify-email")
    @Operation(summary = "Verify email address", description = "Verify user email address using verification token")
    @ApiResponse(responseCode = "302", description = "Redirect to frontend with verification result")
    public void verifyEmail(HttpServletResponse response, 
                           @Parameter(description = "Email verification token") @RequestParam String token) throws IOException {
        try {
            boolean verified = emailVerificationService.verifyEmail(token);
            String redirectUrl = verified ?
                buildRedirectUrl("/login", "verified", "true") :
                buildRedirectUrl("/login", "error", "invalid_token");
            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            String redirectUrl = buildRedirectUrl("/login", "error", "verification_failed");
            response.sendRedirect(redirectUrl);
        }
    }
    
    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email", description = "Resend email verification link to user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verification email sent successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid email or validation failed"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        emailVerificationService.resendVerificationEmail(request.getEmail().trim());
        
        String encodedMessage = URLEncoder.encode("Verification email sent successfully! Please check your inbox.", StandardCharsets.UTF_8);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", encodedMessage
        ));
    }

}