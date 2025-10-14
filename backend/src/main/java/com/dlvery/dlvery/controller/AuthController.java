package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.dto.AuthResponse;
import com.dlvery.dlvery.dto.LoginRequest;
import com.dlvery.dlvery.dto.RegisterRequest;
import com.dlvery.dlvery.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
@Tag(name = "Authentication", description = "Authentication endpoints for inventory and delivery teams")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/inventory/login")
    @Operation(summary = "Inventory team login", description = "Authenticate inventory team members")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "403", description = "Email not verified or invalid role")
    })
    public ResponseEntity<AuthResponse> inventoryLogin(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.authenticateInventoryTeam(loginRequest);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/inventory/register")
    @Operation(summary = "Inventory team registration", description = "Register new inventory team members")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Registration successful"),
        @ApiResponse(responseCode = "400", description = "Invalid input or password validation failed"),
        @ApiResponse(responseCode = "409", description = "Username or email already exists")
    })
    public ResponseEntity<AuthResponse> inventoryRegister(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.registerInventoryTeam(registerRequest);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/delivery/login")
    @Operation(summary = "Delivery team login", description = "Get OAuth2 redirect URL for delivery team")
    @ApiResponse(responseCode = "200", description = "OAuth2 redirect URL provided")
    public ResponseEntity<String> deliveryLogin() {
        String redirectUrl = "/oauth2/authorization/google";
        return ResponseEntity.ok(redirectUrl);
    }
}