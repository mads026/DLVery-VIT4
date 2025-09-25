package com.dlvery.dlvery.dto;

import com.dlvery.dlvery.entity.MovementType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InventoryMovementDto {
    private Long id;
    private String productSku;
    private String productName;
    private MovementType movementType;
    private Integer quantity;
    private String reason;
    private String reference;
    private LocalDateTime movementDate;
    private String performedBy;
}