package com.dlvery.dlvery.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class InventoryRequest {
    private String productCategory;
    private String sku;
    private String productName;
    private Integer quantity;
    private Boolean isDamaged;
    private Boolean isPerishable;
    private LocalDate expiryDate;
}