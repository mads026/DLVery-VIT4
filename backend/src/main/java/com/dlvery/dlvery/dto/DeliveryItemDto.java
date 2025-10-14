package com.dlvery.dlvery.dto;

import lombok.Data;

@Data
public class DeliveryItemDto {
    private Long id;
    private String productSku;
    private String productName;
    private Integer quantity;
}
