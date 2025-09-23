package com.dlvery.dlvery.dto;

import lombok.Data;

@Data
public class DeliveryRequest {
    private String orderId;
    private String customerName;
    private String customerAddress;
    private String deliveryAgentId;
    private String status; // e.g., PENDING, IN_TRANSIT, DELIVERED, FAILED
    private String deliveryNotes;
}