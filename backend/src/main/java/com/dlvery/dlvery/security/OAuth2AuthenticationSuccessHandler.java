package com.dlvery.dlvery.security;

import com.dlvery.dlvery.entity.AuthProvider;
import com.dlvery.dlvery.entity.User;
import com.dlvery.dlvery.entity.UserRole;
import com.dlvery.dlvery.service.EmailVerificationService;
import com.dlvery.dlvery.service.UserService;
import com.dlvery.dlvery.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final EmailVerificationService emailVerificationService;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub");
        
        // First check by email to avoid duplicate email constraint violations
        User user = userService.findByEmail(email);
        
        if (user == null) {
            // Create new delivery team user
            user = new User();
            user.setUsername(email);
            user.setEmail(email);
            user.setFullName(name);
            user.setPasswordHash(null); // No password for OAuth users
            user.setRole(UserRole.DL_TEAM);
            user.setOauthProvider(AuthProvider.GOOGLE);
            user.setOauthProviderId(providerId);
            user.setIsActive(true);
            user.setEmailVerified(false); // Will be verified via email
            user = userService.save(user);
            
            // Send verification email for new OAuth users
            emailVerificationService.sendVerificationEmail(user);
            
            // Redirect with new user verification message - properly encode URL parameters
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
            String encodedMessageText = URLEncoder.encode("📧 Welcome! Verification email sent to " + email + ". Please check your inbox and verify your account.", StandardCharsets.UTF_8);
            
            String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/login")
                .queryParam("message", "verification_sent")
                .queryParam("email", encodedEmail)
                .queryParam("type", "new_user")
                .queryParam("messageText", encodedMessageText)
                .build().toUriString();
            
            response.sendRedirect(redirectUrl);
            return;
        }
        
        // Update existing user's OAuth information if not already set
        if (user.getOauthProvider() == null || user.getOauthProviderId() == null) {
            user.setOauthProvider(AuthProvider.GOOGLE);
            user.setOauthProviderId(providerId);
        }
        
        // Update last login time
        user.updateLastLogin();
        userService.save(user);
        
        // Verify user is delivery team
        if (user.getRole() != UserRole.DL_TEAM) {
            String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/login")
                .queryParam("error", "invalid_role")
                .build().toUriString();
            response.sendRedirect(redirectUrl);
            return;
        }
        
        // Check if email is verified
        if (!user.getEmailVerified()) {
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
            String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/verification-pending")
                .queryParam("email", encodedEmail)
                .build().toUriString();
            response.sendRedirect(redirectUrl);
            return;
        }
        
        String token = jwtUtil.generateToken(user);
        
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/auth/callback")
                .queryParam("token", token)
                .queryParam("role", user.getRole().name())
                .build().toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}