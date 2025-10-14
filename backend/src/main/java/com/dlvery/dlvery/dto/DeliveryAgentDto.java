package com.dlvery.dlvery.dto;

import com.dlvery.dlvery.entity.DeliveryPriority;
import com.dlvery.dlvery.entity.DeliveryStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAgentDto {
    private Long id;
    private String deliveryId;
    private DeliveryStatus status;
    private DeliveryPriority priority;
    private LocalDate scheduledDate;
    private LocalDateTime assignedAt;
    private String customerName;
    private String customerAddress;
    private String customerPhone;
    private List<DeliveryItemDto> items;
    private String notes;
    private String statusReason;
    private boolean isOverdue;
    private int totalItems;
    private String priorityDescription;
}