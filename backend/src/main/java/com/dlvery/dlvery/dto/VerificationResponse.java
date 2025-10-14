package com.dlvery.dlvery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationResponse {
    private boolean success;
    private String message;
    private String email;
}