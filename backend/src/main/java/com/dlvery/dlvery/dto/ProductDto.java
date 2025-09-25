package com.dlvery.dlvery.dto;

import com.dlvery.dlvery.entity.ProductCategory;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProductDto {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private ProductCategory category;
    private Integer quantity;
    private BigDecimal unitPrice;
    private Boolean isDamaged;
    private Boolean isPerishable;
    private LocalDate expiryDate;
}