package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.dto.DeliveryDto;
import com.dlvery.dlvery.entity.DeliveryStatus;
import com.dlvery.dlvery.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class DeliveryController {
    
    private final DeliveryService deliveryService;
    
    @PostMapping
    public ResponseEntity<DeliveryDto> createDelivery(@RequestBody DeliveryDto deliveryDto) {
        return ResponseEntity.ok(deliveryService.createDelivery(deliveryDto));
    }
    
    @GetMapping
    public ResponseEntity<List<DeliveryDto>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.getAllDeliveries());
    }
    
    @GetMapping("/agent/{agent}")
    public ResponseEntity<List<DeliveryDto>> getDeliveriesByAgent(@PathVariable String agent) {
        return ResponseEntity.ok(deliveryService.getDeliveriesByAgent(agent));
    }
    
    @GetMapping("/agent/{agent}/pending")
    public ResponseEntity<List<DeliveryDto>> getPendingDeliveriesByAgent(@PathVariable String agent) {
        return ResponseEntity.ok(deliveryService.getPendingDeliveriesByAgent(agent));
    }
    
    @GetMapping("/product/{sku}")
    public ResponseEntity<List<DeliveryDto>> getDeliveriesByProductSku(@PathVariable String sku) {
        return ResponseEntity.ok(deliveryService.getDeliveriesByProductSku(sku));
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<DeliveryDto>> getDeliveriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(deliveryService.getDeliveriesByDateRange(startDate, endDate));
    }
    
     @GetMapping("/damaged")
     public ResponseEntity<List<DeliveryDto>> getDamagedDeliveries() {
         return ResponseEntity.ok(deliveryService.getDamagedDeliveries());
     }
     
     @GetMapping("/delivered/date-range")
     public ResponseEntity<List<DeliveryDto>> getDeliveredDeliveriesByDateRange(
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
         return ResponseEntity.ok(deliveryService.getDeliveredDeliveriesByDateRange(startDate, endDate));
     }
    
    @GetMapping("/track")
    public ResponseEntity<List<DeliveryDto>> trackDeliveries(
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) String agent) {
        return ResponseEntity.ok(deliveryService.trackDeliveries(sku, agent));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DeliveryDto> updateDeliveryStatus(
            @PathVariable Long id,
            @RequestParam DeliveryStatus status,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) String signature,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(deliveryService.updateDeliveryStatus(id, status, reason, signature, notes));
    }
}
