package com.dlvery.dlvery.dto;

import lombok.Data;
import java.util.Map;

@Data
public class DashboardStatsDto {
    private Long totalProducts;
    private Long availableProducts;
    private Long damagedProducts;
    private Long expiringProducts;
    private Long pendingDeliveries;
    private Long completedDeliveries;
    private Map<String, Long> productsByCategory;
    private Map<String, Long> deliveriesByAgent;
    private Map<String, Long> movementsByType;
}