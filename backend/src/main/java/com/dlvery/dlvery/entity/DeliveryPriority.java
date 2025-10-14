package com.dlvery.dlvery.entity;

public enum DeliveryPriority {
    EMERGENCY(1, "Emergency"),
    PERISHABLE(2, "Perishable"),
    ESSENTIAL(3, "Essential"),
    STANDARD(4, "Standard"),
    LOW(5, "Low Priority");
    
    private final int level;
    private final String description;
    
    DeliveryPriority(int level, String description) {
        this.level = level;
        this.description = description;
    }
    
    public int getLevel() {
        return level;
    }
    
    public String getDescription() {
        return description;
    }
}