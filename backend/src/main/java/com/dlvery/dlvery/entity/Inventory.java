package com.dlvery.dlvery.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_category", nullable = false, length = 50)
    private String productCategory;

    @Column(unique = true, nullable = false, length = 50)
    private String sku; // Stock Keeping Unit

    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "is_damaged", nullable = false)
    private Boolean isDamaged;

    @Column(name = "is_perishable", nullable = false)
    private Boolean isPerishable;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}