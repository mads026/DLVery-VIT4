package com.dlvery.dlvery.dto;

import com.dlvery.dlvery.entity.DeliveryStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryUpdateRequest {
    private Long deliveryId;
    private DeliveryStatus status;
    private String customerName;
    private String statusReason;
    private String notes;
    private String signatureBase64; // Base64 encoded signature image
}