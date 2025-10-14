package com.dlvery.dlvery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAgentOptionDto {
    private String username;
    private String displayName;
    private boolean isAvailable;
}
