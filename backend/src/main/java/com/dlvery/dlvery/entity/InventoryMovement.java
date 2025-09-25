package com.dlvery.dlvery.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_movements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType movementType;
    
    @Column(nullable = false)
    private Integer quantity;
    
    private String reason;
    
    private String reference;
    
    @Column(nullable = false)
    private LocalDateTime movementDate = LocalDateTime.now();
    
    private String performedBy;
}