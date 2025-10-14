package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.dto.DeliveryAgentDto;
import com.dlvery.dlvery.dto.DeliveryUpdateRequest;
import com.dlvery.dlvery.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/delivery-agent")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Delivery Agent", description = "Mobile-optimized APIs for delivery agents")
@PreAuthorize("hasRole('DL_TEAM')")
public class DeliveryAgentController {

    private final DeliveryService deliveryService;

    @GetMapping("/today")
    @Operation(summary = "Get today's deliveries", description = "Fetch all deliveries scheduled for today for the authenticated agent")
    public ResponseEntity<List<DeliveryAgentDto>> getTodaysDeliveries(Authentication authentication) {
        log.info("Fetching today's deliveries for agent: {}", authentication.getName());
        
        List<DeliveryAgentDto> deliveries = deliveryService.getTodaysDeliveries(authentication.getName());
        
        log.info("Found {} deliveries for today for agent: {}", deliveries.size(), authentication.getName());
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending deliveries", description = "Fetch all pending deliveries including overdue ones for the authenticated agent")
    public ResponseEntity<List<DeliveryAgentDto>> getPendingDeliveries(Authentication authentication) {
        log.info("Fetching pending deliveries for agent: {}", authentication.getName());
        
        List<DeliveryAgentDto> deliveries = deliveryService.getPendingDeliveriesForAgent(authentication.getName());
        
        log.info("Found {} pending deliveries for agent: {}", deliveries.size(), authentication.getName());
        return ResponseEntity.ok(deliveries);
    }

    @PutMapping("/update")
    @Operation(summary = "Update delivery status", description = "Update delivery status with customer details and signature")
    public ResponseEntity<DeliveryAgentDto> updateDelivery(
            @Valid @RequestBody DeliveryUpdateRequest request,
            Authentication authentication) {
        
        log.info("Agent {} updating delivery {} to status {}", 
                authentication.getName(), request.getDeliveryId(), request.getStatus());
        
        DeliveryAgentDto updatedDelivery = deliveryService.updateDeliveryByAgent(request);
        
        log.info("Delivery {} updated successfully by agent {}", 
                request.getDeliveryId(), authentication.getName());
        
        return ResponseEntity.ok(updatedDelivery);
    }

    @GetMapping("/delivered")
    @Operation(summary = "Get delivered deliveries", description = "Fetch all delivered deliveries for the authenticated agent")
    public ResponseEntity<List<DeliveryAgentDto>> getDeliveredDeliveries(Authentication authentication) {
        log.info("Fetching delivered deliveries for agent: {}", authentication.getName());
        
        List<DeliveryAgentDto> deliveries = deliveryService.getDeliveredDeliveriesForAgent(authentication.getName());
        
        log.info("Found {} delivered deliveries for agent: {}", deliveries.size(), authentication.getName());
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/delivery/{deliveryId}")
    @Operation(summary = "Get delivery details", description = "Get detailed information about a specific delivery")
    public ResponseEntity<DeliveryAgentDto> getDeliveryDetails(
            @Parameter(description = "Delivery ID") @PathVariable Long deliveryId,
            Authentication authentication) {

        log.info("Agent {} fetching details for delivery {}", authentication.getName(), deliveryId);

        DeliveryAgentDto delivery = deliveryService.getDeliveryByIdAndAgent(deliveryId, authentication.getName());

        if (delivery == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(delivery);
    }
}