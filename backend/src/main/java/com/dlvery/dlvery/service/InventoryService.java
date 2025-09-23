package com.dlvery.dlvery.service;

import com.dlvery.dlvery.entity.Delivery;
import com.dlvery.dlvery.entity.Inventory;
import com.dlvery.dlvery.repository.DeliveryRepository;
import com.dlvery.dlvery.repository.InventoryRepository;
import com.dlvery.dlvery.dto.InventoryRequest;
import com.dlvery.dlvery.dto.InventoryUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final DeliveryRepository deliveryRepository;

    @Transactional
    public Inventory addInventory(InventoryRequest inventoryRequest) {
        if (inventoryRepository.existsBySku(inventoryRequest.getSku())) {
            throw new IllegalArgumentException("SKU already exists.");
        }
        Inventory inventory = new Inventory();
        mapRequestToInventory(inventoryRequest, inventory);
        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Optional<Inventory> getInventoryBySku(String sku) {
        return inventoryRepository.findBySku(sku);
    }

    @Transactional
    public Inventory updateInventory(String sku, InventoryRequest updatedRequest) {
        return inventoryRepository.findBySku(sku).map(inventory -> {
            mapRequestToInventory(updatedRequest, inventory);
            return inventoryRepository.save(inventory);
        }).orElseThrow(() -> new IllegalArgumentException("Inventory with SKU " + sku + " not found."));
    }

    @Transactional
    public void deleteInventory(String sku) {
        inventoryRepository.findBySku(sku)
                .ifPresentOrElse(inventoryRepository::delete, () -> {
                    throw new IllegalArgumentException("Inventory with SKU " + sku + " not found.");
                });
    }

    @Transactional
    public void deleteAllInventory() {
        inventoryRepository.deleteAll();
    }

    @Transactional
    public Inventory updateQuantity(String sku, int quantityChange) {
        return inventoryRepository.findBySku(sku).map(inventory -> {
            int newQuantity = inventory.getQuantity() + quantityChange;
            if (newQuantity < 0) {
                throw new IllegalStateException("Not enough stock for SKU: " + sku);
            }
            inventory.setQuantity(newQuantity);
            return inventoryRepository.save(inventory);
        }).orElseThrow(() -> new IllegalArgumentException("Inventory with SKU " + sku + " not found."));
    }

    @Transactional
    public InventoryUploadResponse uploadInventoryFile(MultipartFile file) {
        int addedCount = 0;
        int updatedCount = 0;
        int totalRecords = 0;
        List<String> failedRecords = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            // Skip header
            reader.readLine();
            while ((line = reader.readLine()) != null) {
                totalRecords++;
                String[] data = line.split(",", -1);
                if (data.length < 7) {
                    failedRecords.add("Record with insufficient data: " + line);
                    continue;
                }

                try {
                    String sku = data[1].trim();
                    Optional<Inventory> existingInventory = inventoryRepository.findBySku(sku);
                    Inventory inventory = existingInventory.orElseGet(Inventory::new);

                    inventory.setProductCategory(data[0].trim());
                    inventory.setSku(sku);
                    inventory.setProductName(data[2].trim());
                    inventory.setQuantity(Integer.parseInt(data[3].trim()));
                    inventory.setIsDamaged(Boolean.parseBoolean(data[4].trim()));
                    inventory.setIsPerishable(Boolean.parseBoolean(data[5].trim()));
                    if (data.length > 6 && !data[6].trim().isEmpty()) {
                        inventory.setExpiryDate(LocalDate.parse(data[6].trim(), DateTimeFormatter.ISO_DATE));
                    }

                    if (existingInventory.isPresent()) {
                        updatedCount++;
                    } else {
                        addedCount++;
                    }
                    inventoryRepository.save(inventory);
                } catch (Exception e) {
                    failedRecords.add("Record processing failed: " + line + " - " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse the uploaded file: " + e.getMessage());
        }

        return new InventoryUploadResponse(
                "File processing complete.",
                totalRecords,
                addedCount,
                updatedCount,
                failedRecords);
    }

    // New reporting methods
    public List<Delivery> getDeliveriesByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        return deliveryRepository.findByCreatedAtBetween(startDateTime, endDateTime);
    }

    public List<Inventory> getDamagedGoods() {
        return inventoryRepository.findByIsDamagedTrue();
    }

    public Map<String, List<Delivery>> getPendingDeliveriesByAgent() {
        List<Delivery> pendingDeliveries = deliveryRepository.findByStatus("PENDING");
        return pendingDeliveries.stream()
                .collect(Collectors.groupingBy(Delivery::getDeliveryAgentId));
    }

    private void mapRequestToInventory(InventoryRequest request, Inventory inventory) {
        if (request.getProductCategory() != null)
            inventory.setProductCategory(request.getProductCategory());
        if (request.getSku() != null)
            inventory.setSku(request.getSku());
        if (request.getProductName() != null)
            inventory.setProductName(request.getProductName());
        if (request.getQuantity() != null)
            inventory.setQuantity(request.getQuantity());
        if (request.getIsDamaged() != null)
            inventory.setIsDamaged(request.getIsDamaged());
        if (request.getIsPerishable() != null)
            inventory.setIsPerishable(request.getIsPerishable());
        if (request.getExpiryDate() != null)
            inventory.setExpiryDate(request.getExpiryDate());
    }
}