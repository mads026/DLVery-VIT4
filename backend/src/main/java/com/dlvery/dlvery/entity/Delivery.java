package com.dlvery.dlvery.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "deliveries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Delivery {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String deliveryId;
    
    @Column(nullable = false)
    private String deliveryAgent;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryPriority priority = DeliveryPriority.STANDARD;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDate scheduledDate = LocalDate.now();
    
    private LocalDateTime assignedAt;
    
    private LocalDateTime deliveredAt;
    
    private String customerName;
    
    private String customerAddress;
    
    private String customerPhone;
    
    @Lob
    @Column(name = "customer_signature", columnDefinition = "LONGBLOB")
    private byte[] customerSignature;
    
    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DeliveryItem> items;
    
    private String notes;
    
    private String statusReason; // For door locked, damaged, etc.
    
    @PreUpdate
    public void preUpdate() {
        if (status == DeliveryStatus.ASSIGNED && assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
        if (status == DeliveryStatus.DELIVERED && deliveredAt == null) {
            deliveredAt = LocalDateTime.now();
        }
    }
}
