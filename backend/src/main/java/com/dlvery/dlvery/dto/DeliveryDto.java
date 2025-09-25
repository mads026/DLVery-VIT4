package com.dlvery.dlvery.dto;

import com.dlvery.dlvery.entity.DeliveryStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DeliveryDto {
    private Long id;
    private String deliveryId;
    private String deliveryAgent;
    private DeliveryStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private String customerAddress;
    private String customerPhone;
    private List<DeliveryItemDto> items;
    private String notes;
}