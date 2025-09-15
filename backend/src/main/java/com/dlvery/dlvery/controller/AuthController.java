package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.dto.AuthResponse;
import com.dlvery.dlvery.dto.LoginRequest;
import com.dlvery.dlvery.dto.RegisterRequest;
import com.dlvery.dlvery.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/inventory/login")
    public ResponseEntity<AuthResponse> inventoryLogin(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.authenticateInventoryTeam(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, null, null, e.getMessage()));
        }
    }
    
    @PostMapping("/inventory/register")
    public ResponseEntity<AuthResponse> inventoryRegister(@RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse response = authService.registerInventoryTeam(registerRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, null, null, e.getMessage()));
        }
    }
    
    @GetMapping("/delivery/login")
    public ResponseEntity<String> deliveryLogin() {
        return ResponseEntity.ok("Redirect to: /oauth2/authorization/google");
    }
}