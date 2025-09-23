package com.dlvery.dlvery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryUploadResponse {
    private String message;
    private Integer totalRecords;
    private Integer recordsAdded;
    private Integer recordsUpdated;
    private List<String> failedRecords;
}