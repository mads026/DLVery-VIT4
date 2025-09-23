package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.entity.Delivery;
import com.dlvery.dlvery.entity.Inventory;
import com.dlvery.dlvery.service.InventoryService;
import com.dlvery.dlvery.dto.InventoryRequest;
import com.dlvery.dlvery.dto.InventoryUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        List<Inventory> inventories = inventoryService.getAllInventory();
        return ResponseEntity.ok(inventories);
    }

    @GetMapping("/{sku}")
    public ResponseEntity<Inventory> getInventoryBySku(@PathVariable String sku) {
        return inventoryService.getInventoryBySku(sku)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> addInventory(@RequestBody InventoryRequest inventoryRequest) {
        try {
            Inventory newInventory = inventoryService.addInventory(inventoryRequest);
            return ResponseEntity.ok(newInventory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{sku}")
    public ResponseEntity<?> updateInventory(@PathVariable String sku, @RequestBody InventoryRequest inventoryRequest) {
        try {
            Inventory updatedInventory = inventoryService.updateInventory(sku, inventoryRequest);
            return ResponseEntity.ok(updatedInventory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{sku}")
    public ResponseEntity<?> deleteInventory(@PathVariable String sku) {
        try {
            inventoryService.deleteInventory(sku);
            return ResponseEntity.ok(Map.of("message", "Inventory with SKU " + sku + " deleted successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{sku}/update-quantity")
    public ResponseEntity<?> updateQuantity(@PathVariable String sku, @RequestBody Map<String, Integer> request) {
        if (!request.containsKey("quantityChange")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Quantity change is required"));
        }

        try {
            int quantityChange = request.get("quantityChange");
            Inventory updatedInventory = inventoryService.updateQuantity(sku, quantityChange);
            return ResponseEntity.ok(updatedInventory);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<?> deleteAllInventory() {
        inventoryService.deleteAllInventory();
        return ResponseEntity.ok(Map.of("message", "All inventory items have been deleted."));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadInventoryFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload."));
        }

        try {
            InventoryUploadResponse response = inventoryService.uploadInventoryFile(file);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports/deliveries")
    public ResponseEntity<List<Delivery>> getDeliveriesInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Delivery> deliveries = inventoryService.getDeliveriesByDateRange(startDate, endDate);
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/reports/damaged")
    public ResponseEntity<List<Inventory>> getDamagedGoodsReport() {
        List<Inventory> damagedGoods = inventoryService.getDamagedGoods();
        return ResponseEntity.ok(damagedGoods);
    }

    @GetMapping("/reports/pending-deliveries")
    public ResponseEntity<Map<String, List<Delivery>>> getPendingDeliveriesByAgent() {
        Map<String, List<Delivery>> pendingDeliveries = inventoryService.getPendingDeliveriesByAgent();
        return ResponseEntity.ok(pendingDeliveries);
    }
}