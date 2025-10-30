package com.dlvery.dlvery.service;

import com.dlvery.dlvery.dto.*;
import com.dlvery.dlvery.entity.*;
import com.dlvery.dlvery.exception.CustomExceptions.*;
import com.dlvery.dlvery.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryService {

    private static final Logger logger = LoggerFactory.getLogger(DeliveryService.class);

    private final DeliveryRepository deliveryRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final DeliveryAgentProfileService deliveryAgentProfileService;
    
    @Transactional
    public DeliveryDto createDelivery(DeliveryDto deliveryDto) {
        logger.info("Creating delivery for agent: {} with {} items",
                deliveryDto.getDeliveryAgent(), deliveryDto.getItems().size());

        // Get display name for the delivery agent
        String displayName = getAgentDisplayName(deliveryDto.getDeliveryAgent());

        Delivery delivery = new Delivery();
        delivery.setDeliveryId(generateDeliveryId());
        delivery.setDeliveryAgent(displayName);
        delivery.setCustomerName(deliveryDto.getCustomerName());
        delivery.setCustomerAddress(deliveryDto.getCustomerAddress());
        delivery.setCustomerPhone(deliveryDto.getCustomerPhone());
        delivery.setNotes(deliveryDto.getNotes());
        
        // Set priority - use provided priority or determine from products
        if (deliveryDto.getPriority() != null) {
            delivery.setPriority(deliveryDto.getPriority());
        } else {
            delivery.setPriority(determineDeliveryPriority(deliveryDto.getItems()));
        }
        
        // Set scheduled date
        if (deliveryDto.getScheduledDate() != null) {
            delivery.setScheduledDate(deliveryDto.getScheduledDate());
        }

        try {
            delivery = deliveryRepository.save(delivery);
            String deliveryId = delivery.getDeliveryId();

            List<DeliveryItem> items = processDeliveryItems(deliveryDto, delivery, deliveryId, displayName);
            delivery.setItems(items);

            DeliveryDto result = convertToDto(delivery);
            logger.info("Delivery {} created successfully with {} items", deliveryId, items.size());
            return result;

        } catch (Exception e) {
            logger.error("Failed to create delivery for agent {}: {}", deliveryDto.getDeliveryAgent(), e.getMessage(), e);
            throw new DeliveryProcessingException("Failed to create delivery: " + e.getMessage(), e);
        }
    }
    
    private List<DeliveryDto> convertDeliveriesToDto(List<Delivery> deliveries) {
        return deliveries.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryDto> getAllDeliveries() {
        logger.debug("Fetching all deliveries");
        List<Delivery> deliveries = deliveryRepository.findAll();

        // Update delivery agent names to use display names instead of usernames
        updateDeliveryAgentNames(deliveries);

        List<DeliveryDto> result = convertDeliveriesToDto(deliveries);
        logger.info("Retrieved {} deliveries", result.size());
        return result;
    }

    @Transactional(readOnly = true)
    public List<DeliveryDto> getDeliveriesByAgent(String agent) {
        logger.debug("Fetching deliveries for agent: {}", agent);
        List<Delivery> deliveries = deliveryRepository.findByDeliveryAgent(agent);
        List<DeliveryDto> result = convertDeliveriesToDto(deliveries);
        logger.info("Retrieved {} deliveries for agent: {}", result.size(), agent);
        return result;
    }

    @Transactional(readOnly = true)
    public List<DeliveryDto> getPendingDeliveriesByAgent(String agent) {
        return convertDeliveriesToDto(deliveryRepository.findByStatusAndAgent(DeliveryStatus.PENDING, agent));
    }

    @Transactional(readOnly = true)
    public List<DeliveryDto> getDeliveriesByProductSku(String sku) {
        return convertDeliveriesToDto(deliveryRepository.findByProductSku(sku));
    }

    @Transactional(readOnly = true)
    public List<DeliveryDto> getDeliveriesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return convertDeliveriesToDto(deliveryRepository.findByDateRange(startDate, endDate));
    }

     @Transactional(readOnly = true)
     public List<DeliveryDto> getDamagedDeliveries() {
         return convertDeliveriesToDto(deliveryRepository.findByStatus(DeliveryStatus.DAMAGED_IN_TRANSIT));
     }

     @Transactional(readOnly = true)
     public List<DeliveryDto> getDeliveredDeliveriesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
         return convertDeliveriesToDto(deliveryRepository.findByStatusAndDateRange(DeliveryStatus.DELIVERED, startDate, endDate));
     }

     @Transactional(readOnly = true)
     public List<DeliveryDto> trackDeliveries(String sku, String agent) {
         logger.debug("Tracking deliveries with sku: {} and agent: {}", sku, agent);

         String trimmedSku = sku != null ? sku.trim() : null;
         String trimmedAgent = agent != null ? agent.trim().toLowerCase() : null;

         boolean hasSku = trimmedSku != null && !trimmedSku.isEmpty();
         boolean hasAgent = trimmedAgent != null && !trimmedAgent.isEmpty();

         List<Delivery> deliveries;

         if (hasSku && hasAgent) {
             // Both criteria provided - find intersection
             deliveries = findDeliveriesBySkuAndAgent(trimmedSku, trimmedAgent);
         } else if (hasSku) {
             deliveries = deliveryRepository.findByProductSku(trimmedSku);
         } else if (hasAgent) {
             deliveries = findDeliveriesByAgent(trimmedAgent);
         } else {
             deliveries = deliveryRepository.findAll();
         }

         return convertDeliveriesToDto(deliveries);
     }

     private List<Delivery> findDeliveriesBySkuAndAgent(String sku, String agent) {
         List<Delivery> skuDeliveries = deliveryRepository.findByProductSku(sku);
         return skuDeliveries.stream()
                 .filter(d -> matchesAgent(d.getDeliveryAgent(), agent))
                 .collect(Collectors.toList());
     }

     private List<Delivery> findDeliveriesByAgent(String agent) {
         return deliveryRepository.findAll().stream()
                 .filter(d -> matchesAgent(d.getDeliveryAgent(), agent))
                 .collect(Collectors.toList());
     }

     private boolean matchesAgent(String deliveryAgent, String searchAgent) {
         return deliveryAgent != null &&
                (deliveryAgent.toLowerCase().contains(searchAgent) ||
                 deliveryAgent.toLowerCase().equals(searchAgent));
     }
    
    @Transactional
    public DeliveryDto updateDeliveryStatus(Long deliveryId, DeliveryStatus status, String reason, String signature, String notes) {
        logger.info("Updating delivery {} status to {} with reason: {}, signature: {}, notes: {}",
                deliveryId, status, reason, signature != null ? "[PROVIDED]" : "[NOT PROVIDED]", notes);

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> {
                    logger.error("Delivery {} not found for status update", deliveryId);
                    return new DeliveryNotFoundException("Delivery not found with ID: " + deliveryId);
                });

        validateStatusTransition(delivery.getStatus(), status, deliveryId);

        try {
            delivery.setStatus(status);

            // Set status reason if provided
            if (reason != null && !reason.trim().isEmpty()) {
                delivery.setStatusReason(reason.trim());
            }

            // Set delivery notes if provided
            if (notes != null && !notes.trim().isEmpty()) {
                delivery.setNotes(notes.trim());
            }

            // Handle signature for delivered status
            if (status == DeliveryStatus.DELIVERED && signature != null && !signature.trim().isEmpty()) {
                try {
                    // Decode base64 signature and store as bytes
                    byte[] signatureBytes = java.util.Base64.getDecoder().decode(signature.trim());
                    delivery.setCustomerSignature(signatureBytes);
                    logger.info("Customer signature stored for delivery {}", deliveryId);
                } catch (Exception e) {
                    logger.warn("Failed to decode signature for delivery {}: {}", deliveryId, e.getMessage());
                }
            }

            if (status == DeliveryStatus.DELIVERED) {
                delivery.setDeliveredAt(LocalDateTime.now());
            }

            delivery = deliveryRepository.save(delivery);
            logger.info("Delivery {} status updated to {}", deliveryId, status);
            return convertToDto(delivery);
        } catch (Exception e) {
            logger.error("Failed to update delivery {} status: {}", deliveryId, e.getMessage(), e);
            throw new DeliveryProcessingException("Failed to update delivery status: " + e.getMessage(), e);
        }
    }

    private void validateStatusTransition(DeliveryStatus currentStatus, DeliveryStatus newStatus, Long deliveryId) {
        if (currentStatus == DeliveryStatus.DELIVERED && newStatus != DeliveryStatus.DELIVERED) {
            throw new InvalidDeliveryStatusException("Cannot change status from DELIVERED to: " + newStatus);
        }
        if (currentStatus == DeliveryStatus.CANCELLED) {
            throw new InvalidDeliveryStatusException("Cannot change status of cancelled delivery");
        }
    }
    
    private String generateDeliveryId() {
        return "DLV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * Get the display name for a delivery agent, falling back to username if profile not found
     */
    private String getAgentDisplayName(String agentUsername) {
        try {
            DeliveryAgentProfileDto profile = deliveryAgentProfileService.getProfileByUsername(agentUsername);
            return profile.getDisplayName() != null ? profile.getDisplayName() : agentUsername;
        } catch (Exception e) {
            logger.warn("Could not fetch profile for agent {}, using username: {}", agentUsername, e.getMessage());
            return agentUsername;
        }
    }

    /**
     * Get agent search names (both username and display name) for comprehensive search
     */
    private String[] getAgentSearchNames(String agentUsername) {
        String displayName = agentUsername;
        try {
            DeliveryAgentProfileDto profile = deliveryAgentProfileService.getProfileByUsername(agentUsername);
            if (profile.getDisplayName() != null) {
                displayName = profile.getDisplayName();
            }
        } catch (Exception e) {
            logger.debug("Could not fetch profile for agent: {}", agentUsername);
        }
        return new String[]{agentUsername, displayName};
    }

    /**
     * Find deliveries by searching multiple agent names using a repository function
     */
    private List<Delivery> findDeliveriesByAgentNames(String[] agentNames, java.util.function.Function<String, List<Delivery>> repoFunction) {
        List<Delivery> allDeliveries = new ArrayList<>();
        for (String name : agentNames) {
            allDeliveries.addAll(repoFunction.apply(name));
        }
        return allDeliveries;
    }

    /**
     * Update delivery agent names from usernames to display names for existing deliveries
     */
    private void updateDeliveryAgentNames(List<Delivery> deliveries) {
        boolean hasUpdates = false;

        for (Delivery delivery : deliveries) {
            String currentAgent = delivery.getDeliveryAgent();
            if (currentAgent != null && !currentAgent.contains(" ")) {
                // If the agent name doesn't contain spaces, it's likely a username
                // Try to get the display name from the profile
                try {
                    String displayName = getAgentDisplayName(currentAgent);
                    if (!currentAgent.equals(displayName)) {
                        delivery.setDeliveryAgent(displayName);
                        hasUpdates = true;
                        logger.debug("Updated delivery {} agent from '{}' to '{}'",
                                delivery.getDeliveryId(), currentAgent, displayName);
                    }
                } catch (Exception e) {
                    logger.warn("Could not update agent name for delivery {}: {}",
                            delivery.getDeliveryId(), e.getMessage());
                }
            }
        }

        if (hasUpdates) {
            try {
                deliveryRepository.saveAll(deliveries);
                logger.info("Updated delivery agent names for {} deliveries", deliveries.size());
            } catch (Exception e) {
                logger.error("Failed to save updated delivery agent names: {}", e.getMessage());
            }
        }
    }
    
    private DeliveryDto convertToDto(Delivery delivery) {
        logger.debug("Converting delivery to DTO - ID: {}", delivery.getDeliveryId());

        DeliveryDto dto = new DeliveryDto();
        dto.setId(delivery.getId());
        dto.setDeliveryId(delivery.getDeliveryId());
        dto.setDeliveryAgent(delivery.getDeliveryAgent());
        dto.setStatus(delivery.getStatus());
        dto.setPriority(delivery.getPriority());
        dto.setCreatedAt(delivery.getCreatedAt());
        dto.setScheduledDate(delivery.getScheduledDate());
        dto.setAssignedAt(delivery.getAssignedAt());
        dto.setDeliveredAt(delivery.getDeliveredAt());
        dto.setCustomerName(delivery.getCustomerName());
        dto.setCustomerAddress(delivery.getCustomerAddress());
        dto.setCustomerPhone(delivery.getCustomerPhone());
        dto.setNotes(delivery.getNotes());
        dto.setStatusReason(delivery.getStatusReason());

        // Convert signature from bytes to base64 string for frontend display
        if (delivery.getCustomerSignature() != null) {
            try {
                String base64Signature = java.util.Base64.getEncoder().encodeToString(delivery.getCustomerSignature());
                dto.setCustomerSignature(base64Signature);
                logger.debug("Converted signature to base64 for delivery {}", delivery.getDeliveryId());
            } catch (Exception e) {
                logger.warn("Failed to convert signature for delivery {}: {}", delivery.getDeliveryId(), e.getMessage());
                dto.setCustomerSignature(null);
            }
        }

        // Safely convert items with null check
        List<DeliveryItemDto> items = Optional.ofNullable(delivery.getItems())
                .filter(itemList -> !itemList.isEmpty())
                .map(itemList -> itemList.stream()
                        .map(this::convertItemToDto)
                        .collect(Collectors.toList()))
                .orElse(new ArrayList<>());

        dto.setItems(items);
        logger.debug("Converted delivery with {} items - ID: {}", items.size(), delivery.getDeliveryId());

        return dto;
    }
    
    private DeliveryItemDto convertItemToDto(DeliveryItem item) {
        DeliveryItemDto dto = new DeliveryItemDto();
        dto.setId(item.getId());
        dto.setProductSku(item.getProduct().getSku());
        dto.setProductName(item.getProduct().getName());
        dto.setQuantity(item.getQuantity());
        return dto;
    }

    private List<DeliveryItem> processDeliveryItems(DeliveryDto deliveryDto, Delivery delivery, String deliveryId, String displayName) {
        List<DeliveryItem> items = new ArrayList<>();
        for (DeliveryItemDto itemDto : deliveryDto.getItems()) {
            DeliveryItem item = createDeliveryItem(itemDto, delivery, deliveryId, displayName);
            items.add(item);

            // Record inventory movement
            inventoryService.recordMovement(item.getProduct(), MovementType.DELIVERY,
                    itemDto.getQuantity(), "Delivery assignment",
                    delivery.getDeliveryId(), displayName);
        }
        return items;
    }

    private DeliveryItem createDeliveryItem(DeliveryItemDto itemDto, Delivery delivery, String deliveryId, String displayName) {
        Product product = productRepository.findBySku(itemDto.getProductSku())
                .orElseThrow(() -> {
                    logger.error("Product not found during delivery creation - SKU: {}, Delivery ID: {}",
                            itemDto.getProductSku(), deliveryId);
                    return new ProductNotFoundException("Product not found: " + itemDto.getProductSku());
                });

        if (product.getQuantity() < itemDto.getQuantity()) {
            logger.error("Insufficient stock for product during delivery creation - Product: {}, SKU: {}, " +
                    "Available: {}, Requested: {}, Delivery ID: {}",
                    product.getName(), product.getSku(), product.getQuantity(),
                    itemDto.getQuantity(), deliveryId);
            throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
        }

        DeliveryItem item = new DeliveryItem();
        item.setDelivery(delivery);
        item.setProduct(product);
        item.setQuantity(itemDto.getQuantity());
        return item;
    }
    
    /**
     * Determine delivery priority based on product characteristics
     */
    private DeliveryPriority determineDeliveryPriority(List<DeliveryItemDto> items) {
        DeliveryPriority highestPriority = DeliveryPriority.STANDARD;
        
        for (DeliveryItemDto itemDto : items) {
            Product product = productRepository.findBySku(itemDto.getProductSku()).orElse(null);
            if (product != null) {
                DeliveryPriority itemPriority = getProductPriority(product);
                if (itemPriority.getLevel() < highestPriority.getLevel()) {
                    highestPriority = itemPriority;
                }
            }
        }
        
        return highestPriority;
    }
    
    /**
     * Get priority for a product based on its characteristics
     */
    private DeliveryPriority getProductPriority(Product product) {
        // Emergency priority for pharmaceuticals
        if (product.getCategory() == ProductCategory.PHARMACEUTICALS) {
            return DeliveryPriority.EMERGENCY;
        }
        
        // Perishable priority for items with expiry dates or perishable flag
        if (product.getIsPerishable() || 
            (product.getExpiryDate() != null && 
             product.getExpiryDate().isBefore(java.time.LocalDate.now().plusDays(3)))) {
            return DeliveryPriority.PERISHABLE;
        }
        
        // Essential priority for food, beverages, and health/beauty
        if (product.getCategory() == ProductCategory.FOOD_BEVERAGES ||
            product.getCategory() == ProductCategory.HEALTH_BEAUTY ||
            product.getCategory() == ProductCategory.FRESH_PRODUCE ||
            product.getCategory() == ProductCategory.FROZEN_GOODS) {
            return DeliveryPriority.ESSENTIAL;
        }
        
        // Standard priority for everything else
        return DeliveryPriority.STANDARD;
    }

    // ===== DELIVERY AGENT SPECIFIC METHODS =====
    
    @Transactional(readOnly = true)
    public List<DeliveryAgentDto> getTodaysDeliveries(String agentUsername) {
        logger.info("Fetching today's deliveries for agent: {}", agentUsername);

        String[] searchNames = getAgentSearchNames(agentUsername);
        List<Delivery> deliveries = findDeliveriesByAgentNames(searchNames,
            name -> deliveryRepository.findTodaysDeliveriesByAgent(name));

        logger.info("Found {} today's deliveries for agent: {}", deliveries.size(), agentUsername);

        return deliveries.stream()
                .map(this::convertToAgentDto)
                .sorted((d1, d2) -> d1.getPriority().getLevel() - d2.getPriority().getLevel())
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DeliveryAgentDto> getPendingDeliveriesForAgent(String agentUsername) {
        logger.info("Fetching pending deliveries for agent: {}", agentUsername);

        String[] searchNames = getAgentSearchNames(agentUsername);
        List<Delivery> deliveries = findDeliveriesByAgentNames(searchNames,
            name -> deliveryRepository.findPendingDeliveriesByAgent(name));

        logger.info("Found {} pending deliveries for agent: {}", deliveries.size(), agentUsername);

        return deliveries.stream()
                .map(this::convertToAgentDto)
                .sorted((d1, d2) -> d1.getPriority().getLevel() - d2.getPriority().getLevel())
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DeliveryAgentDto> getDeliveredDeliveriesForAgent(String agentUsername) {
        logger.info("Fetching delivered deliveries for agent: {}", agentUsername);

        String[] searchNames = getAgentSearchNames(agentUsername);
        List<Delivery> deliveries = findDeliveriesByAgentNames(searchNames,
            name -> deliveryRepository.findDeliveredDeliveriesByAgent(name));

        logger.info("Found {} delivered deliveries for agent: {}", deliveries.size(), agentUsername);

        return deliveries.stream()
                .map(this::convertToAgentDto)
                .sorted((d1, d2) -> d2.getAssignedAt() != null && d1.getAssignedAt() != null ?
                    d2.getAssignedAt().compareTo(d1.getAssignedAt()) : 0) // Most recent first
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryAgentDto updateDeliveryByAgent(DeliveryUpdateRequest request) {
        logger.info("Agent updating delivery {} to status {}", request.getDeliveryId(), request.getStatus());
        
        Delivery delivery = deliveryRepository.findById(request.getDeliveryId())
                .orElseThrow(() -> new DeliveryNotFoundException("Delivery not found with ID: " + request.getDeliveryId()));
        
        // Prevent updating already completed deliveries
        if (isDeliveryCompleted(delivery.getStatus())) {
            logger.warn("Attempt to update completed delivery {} with status {}", request.getDeliveryId(), delivery.getStatus());
            throw new InvalidDeliveryStatusException("Cannot update a completed delivery. Current status: " + delivery.getStatus());
        }
        
        // Update delivery fields
        delivery.setStatus(request.getStatus());
        delivery.setStatusReason(request.getStatusReason());
        
        if (request.getCustomerName() != null) {
            delivery.setCustomerName(request.getCustomerName());
        }
        
        if (request.getNotes() != null) {
            delivery.setNotes(request.getNotes());
        }
        
        // Handle signature for delivered status - signature is now stored as string
        if (request.getStatus() == DeliveryStatus.DELIVERED && request.getSignatureBase64() != null && !request.getSignatureBase64().trim().isEmpty()) {
            try {
                // Decode base64 signature and store as bytes
                byte[] signatureBytes = java.util.Base64.getDecoder().decode(request.getSignatureBase64().trim());
                delivery.setCustomerSignature(signatureBytes);
            } catch (Exception e) {
                logger.warn("Failed to decode signature for delivery {}: {}", request.getDeliveryId(), e.getMessage());
            }
        }
        
        delivery = deliveryRepository.save(delivery);
        logger.info("Delivery {} updated successfully by agent", request.getDeliveryId());
        
        return convertToAgentDto(delivery);
    }
    
    private boolean isDeliveryCompleted(DeliveryStatus status) {
        return status == DeliveryStatus.DELIVERED || 
               status == DeliveryStatus.RETURNED || 
               status == DeliveryStatus.DAMAGED_IN_TRANSIT || 
               status == DeliveryStatus.DOOR_LOCKED;
    }
    
    private DeliveryAgentDto convertToAgentDto(Delivery delivery) {
        DeliveryAgentDto dto = new DeliveryAgentDto();
        dto.setId(delivery.getId());
        dto.setDeliveryId(delivery.getDeliveryId());
        dto.setStatus(delivery.getStatus());
        dto.setPriority(delivery.getPriority());
        dto.setScheduledDate(delivery.getScheduledDate());
        dto.setAssignedAt(delivery.getAssignedAt());
        dto.setCustomerName(delivery.getCustomerName());
        dto.setCustomerAddress(delivery.getCustomerAddress());
        dto.setCustomerPhone(delivery.getCustomerPhone());
        dto.setNotes(delivery.getNotes());
        dto.setStatusReason(delivery.getStatusReason());
        dto.setPriorityDescription(delivery.getPriority().getDescription());
        
        // Check if delivery is overdue (scheduled for past date and not delivered)
        dto.setOverdue(delivery.getScheduledDate().isBefore(java.time.LocalDate.now()) 
                && delivery.getStatus() != DeliveryStatus.DELIVERED);
        
        // Convert items
        if (delivery.getItems() != null) {
            dto.setItems(delivery.getItems().stream()
                    .map(this::convertItemToDto)
                    .collect(Collectors.toList()));
            dto.setTotalItems(delivery.getItems().size());
        } else {
            dto.setItems(new ArrayList<>());
            dto.setTotalItems(0);
        }
        
        return dto;
    }

    @Transactional(readOnly = true)
    public DeliveryAgentDto getDeliveryByIdAndAgent(Long deliveryId, String agentUsername) {
        logger.debug("Fetching delivery {} for agent {}", deliveryId, agentUsername);

        Delivery delivery = deliveryRepository.findById(deliveryId).orElse(null);
        if (delivery == null) {
            return null;
        }

        // Verify the delivery belongs to this agent
        String[] searchNames = getAgentSearchNames(agentUsername);
        String deliveryAgent = delivery.getDeliveryAgent();

        for (String name : searchNames) {
            if (name.equals(deliveryAgent)) {
                return convertToAgentDto(delivery);
            }
        }

        return null;
    }
}
