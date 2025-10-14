package com.dlvery.dlvery.dto;

import com.dlvery.dlvery.entity.DeliveryStatus;
import com.dlvery.dlvery.entity.DeliveryPriority;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
public class DeliveryDto {
    private Long id;
    private String deliveryId;
    private String deliveryAgent;
    private DeliveryStatus status;
    private DeliveryPriority priority;
    private LocalDateTime createdAt;
    private LocalDate scheduledDate;
    private LocalDateTime assignedAt;
    private LocalDateTime deliveredAt;
    private String customerName;
    private String customerAddress;
    private String customerPhone;
    private List<DeliveryItemDto> items;
    private String notes;
    private String statusReason;
    private String customerSignature; // Base64 encoded for frontend
}
