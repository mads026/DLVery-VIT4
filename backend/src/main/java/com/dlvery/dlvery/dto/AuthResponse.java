package com.dlvery.dlvery.dto;

import com.dlvery.dlvery.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private UserRole role;
    private String message;
}