package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.dto.*;
import com.dlvery.dlvery.entity.MovementType;
import com.dlvery.dlvery.service.InventoryService;
import com.dlvery.dlvery.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class InventoryController {

    private final InventoryService inventoryService;
    private final FileUploadService fileUploadService;

    private ResponseEntity<String> buildErrorResponse(String message, int statusCode) {
        return ResponseEntity.status(statusCode)
                .header("Content-Type", "text/plain; charset=UTF-8")
                .body(message);
    }
    
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(inventoryService.getAllProducts());
    }
    
    @GetMapping("/products/available")
    public ResponseEntity<List<ProductDto>> getAvailableProducts() {
        return ResponseEntity.ok(inventoryService.getAvailableProducts());
    }
    
    @GetMapping("/products/{sku}")
    public ResponseEntity<ProductDto> getProductBySku(@PathVariable String sku) {
        return ResponseEntity.ok(inventoryService.getProductBySku(sku));
    }
    
    @PostMapping("/products")
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto productDto) {
        return ResponseEntity.ok(inventoryService.createProduct(productDto));
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody ProductDto productDto) {
        return ResponseEntity.ok(inventoryService.updateProduct(id, productDto));
    }
    
    @PostMapping("/products/{sku}/movement")
    public ResponseEntity<String> recordMovement(
            @PathVariable String sku,
            @RequestParam MovementType type,
            @RequestParam Integer quantity,
            @RequestParam String reason,
            @RequestParam(required = false) String reference,
            @RequestParam String performedBy) {
        
        try {
            inventoryService.recordMovementBySku(sku, type, quantity, reason, reference, performedBy);
            return ResponseEntity.ok("Movement recorded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error recording movement: " + e.getMessage());
        }
    }
    
    @GetMapping("/products/{sku}/movements")
    public ResponseEntity<List<InventoryMovementDto>> getMovementHistory(@PathVariable String sku) {
        return ResponseEntity.ok(inventoryService.getMovementHistory(sku));
    }
    
    @PostMapping("/upload")
    public ResponseEntity<String> uploadInventoryFile(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }
            
             // Check file type
             String filename = file.getOriginalFilename();
             if (filename == null || (!filename.toLowerCase().endsWith(".csv") && !filename.toLowerCase().endsWith(".xlsx"))) {
                 return ResponseEntity.badRequest().body("Please upload a CSV or XLSX file");
             }
            
            // Process file
            String result = fileUploadService.processInventoryFile(file);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/plain; charset=UTF-8")
                    .body(result);
                    
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), 400);
        } catch (Exception e) {
            return buildErrorResponse("An unexpected error occurred while processing the file. Please try again.", 500);
        }
    }
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(inventoryService.getDashboardStats());
    }
    
     @GetMapping("/template")
     public ResponseEntity<byte[]> downloadTemplate() {
         try {
             byte[] xlsxContent = inventoryService.generateXlsxTemplate();
             
             return ResponseEntity.ok()
                     .header("Content-Disposition", "attachment; filename=inventory_template.xlsx")
                     .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                     .body(xlsxContent);
         } catch (Exception e) {
             return ResponseEntity.internalServerError().build();
         }
     }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        try {
            inventoryService.deleteProduct(id);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), 400);
        } catch (Exception e) {
            return buildErrorResponse("An unexpected error occurred while deleting the product. Please try again or contact support.", 500);
        }
    }

    @GetMapping("/skus")
    public ResponseEntity<List<String>> getAllSkus() {
        return ResponseEntity.ok(inventoryService.getAllSkus());
    }

    @GetMapping("/agents")
    public ResponseEntity<List<String>> getAllDeliveryAgents() {
        return ResponseEntity.ok(inventoryService.getAllDeliveryAgents());
    }

}