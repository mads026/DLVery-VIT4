package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.dto.AuthResponse;
import com.dlvery.dlvery.dto.LoginRequest;
import com.dlvery.dlvery.dto.RegisterRequest;
import com.dlvery.dlvery.entity.UserRole;
import com.dlvery.dlvery.service.AuthService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Authentication Controller Tests")
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("SecurePass123!");
        registerRequest.setConfirmPassword("SecurePass123!");
        registerRequest.setFullName("Test User");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("SecurePass123!");

        authResponse = new AuthResponse("jwt-token", "testuser", "test@example.com", UserRole.INV_TEAM, "Login successful");
    }

    @Test
    @DisplayName("Should register inventory user successfully")
    void testInventoryRegisterSuccess() {
        when(authService.registerInventoryTeam(any(RegisterRequest.class))).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.inventoryRegister(registerRequest);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        AuthResponse responseBody = response.getBody();
        assertNotNull(responseBody);
        assertEquals("testuser", responseBody.getUsername());
        assertEquals(UserRole.INV_TEAM, responseBody.getRole());
    }

    @Test
    @DisplayName("Should login inventory user successfully")
    void testInventoryLoginSuccess() {
        when(authService.authenticateInventoryTeam(any(LoginRequest.class))).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.inventoryLogin(loginRequest);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        AuthResponse responseBody = response.getBody();
        assertNotNull(responseBody);
        assertEquals("jwt-token", responseBody.getToken());
        assertEquals("testuser", responseBody.getUsername());
        assertEquals(UserRole.INV_TEAM, responseBody.getRole());
    }

    @Test
    @DisplayName("Should return OAuth redirect for delivery login")
    void testDeliveryLoginRedirect() {
        ResponseEntity<String> response = authController.deliveryLogin();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Redirect to: /oauth2/authorization/google", response.getBody());
    }
}