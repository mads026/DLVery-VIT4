package com.dlvery.dlvery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryProfileDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
