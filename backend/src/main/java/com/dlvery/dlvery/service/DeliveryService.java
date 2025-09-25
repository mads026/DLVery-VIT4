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
    
    @Transactional
    public DeliveryDto createDelivery(DeliveryDto deliveryDto) {
        logger.info("Creating delivery for agent: {} with {} items",
                deliveryDto.getDeliveryAgent(), deliveryDto.getItems().size());

        Delivery delivery = new Delivery();
        delivery.setDeliveryId(generateDeliveryId());
        delivery.setDeliveryAgent(deliveryDto.getDeliveryAgent());
        delivery.setCustomerAddress(deliveryDto.getCustomerAddress());
        delivery.setCustomerPhone(deliveryDto.getCustomerPhone());
        delivery.setNotes(deliveryDto.getNotes());

        try {
            delivery = deliveryRepository.save(delivery);
            String deliveryId = delivery.getDeliveryId();

            List<DeliveryItem> items = processDeliveryItems(deliveryDto, delivery, deliveryId);
            delivery.setItems(items);

            DeliveryDto result = convertToDto(delivery);
            logger.info("Delivery {} created successfully with {} items", deliveryId, items.size());
            return result;

        } catch (Exception e) {
            logger.error("Failed to create delivery for agent {}: {}", deliveryDto.getDeliveryAgent(), e.getMessage(), e);
            throw new DeliveryProcessingException("Failed to create delivery: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<DeliveryDto> getAllDeliveries() {
        logger.debug("Fetching all deliveries");
        List<DeliveryDto> deliveries = deliveryRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        logger.info("Retrieved {} deliveries", deliveries.size());
        return deliveries;
    }
    
    @Transactional(readOnly = true)
    public List<DeliveryDto> getDeliveriesByAgent(String agent) {
        logger.debug("Fetching deliveries for agent: {}", agent);
        List<DeliveryDto> deliveries = deliveryRepository.findByDeliveryAgent(agent).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        logger.info("Retrieved {} deliveries for agent: {}", deliveries.size(), agent);
        return deliveries;
    }
    
    @Transactional(readOnly = true)
    public List<DeliveryDto> getPendingDeliveriesByAgent(String agent) {
        return deliveryRepository.findByStatusAndAgent(DeliveryStatus.PENDING, agent).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DeliveryDto> getDeliveriesByProductSku(String sku) {
        return deliveryRepository.findByProductSku(sku).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DeliveryDto> getDeliveriesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return deliveryRepository.findByDateRange(startDate, endDate).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
     @Transactional(readOnly = true)
     public List<DeliveryDto> getDamagedDeliveries() {
         return deliveryRepository.findByStatus(DeliveryStatus.DAMAGED_IN_TRANSIT).stream()
                 .map(this::convertToDto)
                 .collect(Collectors.toList());
     }
     
     @Transactional(readOnly = true)
     public List<DeliveryDto> getDeliveredDeliveriesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
         return deliveryRepository.findByStatusAndDateRange(DeliveryStatus.DELIVERED, startDate, endDate).stream()
                 .map(this::convertToDto)
                 .collect(Collectors.toList());
     }

     @Transactional(readOnly = true)
     public List<DeliveryDto> trackDeliveries(String sku, String agent) {
         List<Delivery> deliveries = new ArrayList<>();

         boolean hasSku = sku != null && !sku.trim().isEmpty();
         boolean hasAgent = agent != null && !agent.trim().isEmpty();

         if (hasSku) {
             deliveries.addAll(deliveryRepository.findByProductSku(sku));
         }
         if (hasAgent) {
             deliveries.addAll(deliveryRepository.findByDeliveryAgent(agent));
         }

         return deliveries.stream()
                 .distinct()
                 .map(this::convertToDto)
                 .collect(Collectors.toList());
     }
    
    @Transactional
    public DeliveryDto updateDeliveryStatus(Long deliveryId, DeliveryStatus status) {
        logger.info("Updating delivery {} status to {}", deliveryId, status);

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> {
                    logger.error("Delivery {} not found for status update", deliveryId);
                    return new DeliveryNotFoundException("Delivery not found with ID: " + deliveryId);
                });

        validateStatusTransition(delivery.getStatus(), status, deliveryId);

        try {
            delivery.setStatus(status);
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
    
    private DeliveryDto convertToDto(Delivery delivery) {
        logger.debug("Converting delivery to DTO - ID: {}", delivery.getDeliveryId());

        DeliveryDto dto = new DeliveryDto();
        dto.setId(delivery.getId());
        dto.setDeliveryId(delivery.getDeliveryId());
        dto.setDeliveryAgent(delivery.getDeliveryAgent());
        dto.setStatus(delivery.getStatus());
        dto.setCreatedAt(delivery.getCreatedAt());
        dto.setDeliveredAt(delivery.getDeliveredAt());
        dto.setCustomerAddress(delivery.getCustomerAddress());
        dto.setCustomerPhone(delivery.getCustomerPhone());
        dto.setNotes(delivery.getNotes());

        try {
            if (delivery.getItems() != null && !delivery.getItems().isEmpty()) {
                dto.setItems(delivery.getItems().stream()
                        .map(this::convertItemToDto)
                        .collect(Collectors.toList()));
                logger.debug("Converted delivery with {} items - ID: {}",
                        delivery.getItems().size(), delivery.getDeliveryId());
            } else {
                dto.setItems(new ArrayList<>());
                logger.debug("Converted delivery with no items - ID: {}", delivery.getDeliveryId());
            }
        } catch (Exception e) {
            // Fallback in case of lazy loading issues
            logger.warn("Lazy loading issue encountered while converting delivery to DTO - ID: {}, Error: {}",
                    delivery.getDeliveryId(), e.getMessage(), e);
            dto.setItems(new ArrayList<>());
        }

        return dto;
    }
    
    private DeliveryItemDto convertItemToDto(DeliveryItem item) {
        DeliveryItemDto dto = new DeliveryItemDto();
        dto.setId(item.getId());
        dto.setProductSku(item.getProduct().getSku());
        dto.setProductName(item.getProduct().getName());
        dto.setQuantity(item.getQuantity());
        dto.setIsDamaged(item.getIsDamaged());
        return dto;
    }

    private List<DeliveryItem> processDeliveryItems(DeliveryDto deliveryDto, Delivery delivery, String deliveryId) {
        List<DeliveryItem> items = new ArrayList<>();
        for (DeliveryItemDto itemDto : deliveryDto.getItems()) {
            DeliveryItem item = createDeliveryItem(itemDto, delivery, deliveryId, deliveryDto.getDeliveryAgent());
            items.add(item);

            // Record inventory movement
            inventoryService.recordMovement(item.getProduct(), MovementType.DELIVERY,
                    itemDto.getQuantity(), "Delivery assignment",
                    delivery.getDeliveryId(), deliveryDto.getDeliveryAgent());
        }
        return items;
    }

    private DeliveryItem createDeliveryItem(DeliveryItemDto itemDto, Delivery delivery, String deliveryId, String agent) {
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
        item.setIsDamaged(itemDto.getIsDamaged());
        return item;
    }
}