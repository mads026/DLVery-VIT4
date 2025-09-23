package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.entity.Delivery;
import com.dlvery.dlvery.service.DeliveryService;
import com.dlvery.dlvery.dto.DeliveryRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping
    public ResponseEntity<?> createDelivery(@RequestBody DeliveryRequest request) {
        try {
            Delivery delivery = deliveryService.createDelivery(request);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.getAllDeliveries());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Delivery> getDeliveryByOrderId(@PathVariable String orderId) {
        return deliveryService.getDeliveryByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateDeliveryStatus(@PathVariable String orderId,
            @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status field is required."));
        }

        try {
            Delivery updatedDelivery = deliveryService.updateDeliveryStatus(orderId, newStatus);
            return ResponseEntity.ok(updatedDelivery);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}