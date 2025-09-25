 package com.dlvery.dlvery.service;
 
 import com.dlvery.dlvery.dto.*;
 import com.dlvery.dlvery.entity.*;
 import com.dlvery.dlvery.repository.*;
 import lombok.RequiredArgsConstructor;
 import org.apache.poi.ss.usermodel.*;
 import org.apache.poi.xssf.usermodel.XSSFWorkbook;
 import org.springframework.stereotype.Service;
 import org.springframework.transaction.annotation.Transactional;
 
 import java.io.ByteArrayOutputStream;
 import java.io.IOException;
 import java.math.BigDecimal;
 import java.time.LocalDate;
 import java.util.ArrayList;
 import java.util.List;
 import java.util.Map;
 import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryMovementRepository movementRepository;
    private final DeliveryRepository deliveryRepository;
    
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ProductDto> getAvailableProducts() {
        return productRepository.findAvailableProducts().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public ProductDto getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        return convertToDto(product);
    }
    
    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        Product product = convertToEntity(productDto);
        product = productRepository.save(product);
        
        // Record initial inventory movement
        recordMovement(product, MovementType.IN, product.getQuantity(), 
                      "Initial stock", "INITIAL", "System");
        
        return convertToDto(product);
    }
    
    @Transactional
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Integer oldQuantity = existingProduct.getQuantity();

        // Record quantity adjustment if changed
        if (!oldQuantity.equals(productDto.getQuantity())) {
            int difference = productDto.getQuantity() - oldQuantity;
            MovementType type = difference > 0 ? MovementType.IN : MovementType.OUT;
            recordMovement(existingProduct, type, Math.abs(difference),
                          "Quantity adjustment", "ADJUSTMENT", "System");
        }

        existingProduct.setName(productDto.getName());
        existingProduct.setDescription(productDto.getDescription());
        existingProduct.setCategory(productDto.getCategory());
        existingProduct.setQuantity(productDto.getQuantity());
        existingProduct.setUnitPrice(productDto.getUnitPrice());
        existingProduct.setIsDamaged(productDto.getIsDamaged());
        existingProduct.setIsPerishable(productDto.getIsPerishable());
        existingProduct.setExpiryDate(productDto.getExpiryDate());

        Product savedProduct = productRepository.save(existingProduct);

        return convertToDto(savedProduct);
    }
    
    @Transactional
    public void recordMovement(Product product, MovementType type, Integer quantity, 
                              String reason, String reference, String performedBy) {
        InventoryMovement movement = new InventoryMovement();
        movement.setProduct(product);
        movement.setMovementType(type);
        movement.setQuantity(quantity);
        movement.setReason(reason);
        movement.setReference(reference);
        movement.setPerformedBy(performedBy);
        
        movementRepository.save(movement);
        
        // Update product quantity
        if (type == MovementType.IN) {
            product.setQuantity(product.getQuantity() + quantity);
        } else if (type == MovementType.OUT || type == MovementType.DELIVERY) {
            product.setQuantity(product.getQuantity() - quantity);
        }
        
        productRepository.save(product);
    }
    
    @Transactional
    public void recordMovementBySku(String sku, MovementType type, Integer quantity, 
                                   String reason, String reference, String performedBy) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        
        recordMovement(product, type, quantity, reason, reference, performedBy);
    }
    
    public List<InventoryMovementDto> getMovementHistory(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        return movementRepository.findByProductId(product.getId()).stream()
                .map(this::convertMovementToDto)
                .collect(Collectors.toList());
    }
    
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        stats.setTotalProducts((long) productRepository.findAll().size());
        stats.setAvailableProducts((long) productRepository.findAvailableProducts().size());
        stats.setDamagedProducts((long) productRepository.findByIsDamaged(true).size());
        stats.setExpiringProducts((long) productRepository.findExpiringProducts(LocalDate.now().plusDays(7)).size());
        stats.setPendingDeliveries((long) deliveryRepository.findByStatus(DeliveryStatus.PENDING).size());
        stats.setCompletedDeliveries((long) deliveryRepository.findByStatus(DeliveryStatus.DELIVERED).size());
        
        // Category distribution
        Map<String, Long> categoryStats = productRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                    p -> p.getCategory().name(),
                    Collectors.counting()
                ));
        stats.setProductsByCategory(categoryStats);
        
        return stats;
    }
    
    public String generateCsvTemplate() {
        StringBuilder csvBuilder = new StringBuilder();

        // Add header with format information
        csvBuilder.append("# CSV Template for Product Import\n");
        csvBuilder.append("# Date formats supported: YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY, DD/MM/YYYY\n");
        csvBuilder.append("# Categories: ").append(String.join(", ", getValidCategoryNames())).append("\n");
        csvBuilder.append("sku,name,description,category,quantity,unitPrice,isDamaged,isPerishable,expiryDate\n");

        // Add sample data for each category
        List<ProductDto> samples = generateSampleProducts();
        int counter = 1;

        for (ProductDto product : samples) {
            String expiryDate = product.getExpiryDate() != null ? product.getExpiryDate().toString() : "";

            // Add some variety in date formats for examples
            if (product.getIsPerishable() && counter % 3 == 0) {
                expiryDate = "31-12-2024"; // DD-MM-YYYY format
            } else if (product.getIsPerishable() && counter % 3 == 1) {
                expiryDate = "12/31/2024"; // MM/DD/YYYY format
            }

            csvBuilder.append(String.format("%s,%s,%s,%s,%d,%.2f,%s,%s,%s\n",
                product.getSku(), product.getName(), product.getDescription(),
                product.getCategory().name(), product.getQuantity(),
                product.getUnitPrice().doubleValue(), product.getIsDamaged(),
                product.getIsPerishable(), expiryDate));

            counter++;
        }

        return csvBuilder.toString();
    }
     
     public byte[] generateXlsxTemplate() throws IOException {
         try (Workbook workbook = new XSSFWorkbook()) {
             Sheet sheet = workbook.createSheet("Inventory Template");
             
             // Create header style
             CellStyle headerStyle = workbook.createCellStyle();
             Font headerFont = workbook.createFont();
             headerFont.setBold(true);
             headerStyle.setFont(headerFont);
             
             // Create header row
             Row headerRow = sheet.createRow(0);
             String[] headers = {"sku", "name", "description", "category", "quantity", "unitPrice", "isDamaged", "isPerishable", "expiryDate"};
             for (int i = 0; i < headers.length; i++) {
                 Cell cell = headerRow.createCell(i);
                 cell.setCellValue(headers[i]);
                 cell.setCellStyle(headerStyle);
             }
             
             // Add sample data for each category
             List<ProductDto> samples = generateSampleProducts();
             int rowNum = 1;
             int counter = 1;

             for (ProductDto product : samples) {
                 Row row = sheet.createRow(rowNum++);
                 String expiryDate = product.getExpiryDate() != null ? product.getExpiryDate().toString() : "";

                 // Add some variety in date formats for examples
                 if (product.getIsPerishable() && counter % 3 == 0) {
                     expiryDate = "31-12-2024"; // DD-MM-YYYY format
                 } else if (product.getIsPerishable() && counter % 3 == 1) {
                     expiryDate = "12/31/2024"; // MM/DD/YYYY format
                 }

                 row.createCell(0).setCellValue(product.getSku());
                 row.createCell(1).setCellValue(product.getName());
                 row.createCell(2).setCellValue(product.getDescription());
                 row.createCell(3).setCellValue(product.getCategory().name());
                 row.createCell(4).setCellValue(product.getQuantity());
                 row.createCell(5).setCellValue(product.getUnitPrice().doubleValue());
                 row.createCell(6).setCellValue(product.getIsDamaged());
                 row.createCell(7).setCellValue(product.getIsPerishable());
                 row.createCell(8).setCellValue(expiryDate);

                 counter++;
             }
             
             // Auto-size columns
             for (int i = 0; i < headers.length; i++) {
                 sheet.autoSizeColumn(i);
             }
             
             // Write to byte array
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
             workbook.write(outputStream);
             return outputStream.toByteArray();
         }
     }
    
    private String getSampleProductName(ProductCategory category) {
        return switch (category) {
            case ELECTRONICS -> "Smartphone";
            case CLOTHING -> "Cotton T-Shirt";
            case FOOD_BEVERAGES -> "Energy Drink";
            case HOME_GARDEN -> "Coffee Maker";
            case BOOKS -> "Programming Guide";
            case TOYS_GAMES -> "Building Blocks";
            case HEALTH_BEAUTY -> "Vitamin C";
            case SPORTS_OUTDOORS -> "Tennis Ball";
            case AUTOMOTIVE -> "Car Oil";
            case OFFICE_SUPPLIES -> "Notebook";
            case PHARMACEUTICALS -> "Pain Relief";
            case FROZEN_GOODS -> "Ice Cream";
            case FRESH_PRODUCE -> "Organic Apples";
            case OTHER -> "Gift Card";
        };
    }

    private String getSampleDescription(ProductCategory category) {
        return switch (category) {
            case ELECTRONICS -> "Latest model smartphone";
            case CLOTHING -> "100% cotton t-shirt";
            case FOOD_BEVERAGES -> "Natural energy drink";
            case HOME_GARDEN -> "Automatic coffee maker";
            case BOOKS -> "Learn programming basics";
            case TOYS_GAMES -> "Educational toy blocks";
            case HEALTH_BEAUTY -> "Health supplement";
            case SPORTS_OUTDOORS -> "Professional tennis ball";
            case AUTOMOTIVE -> "Engine oil";
            case OFFICE_SUPPLIES -> "Office notebook";
            case PHARMACEUTICALS -> "Over-the-counter medicine";
            case FROZEN_GOODS -> "Vanilla ice cream";
            case FRESH_PRODUCE -> "Fresh organic apples";
            case OTHER -> "Store gift card";
        };
    }
    
    private boolean isPerishableCategory(ProductCategory category) {
        return category == ProductCategory.FRESH_PRODUCE || 
               category == ProductCategory.FROZEN_GOODS || 
               category == ProductCategory.PHARMACEUTICALS ||
               category == ProductCategory.FOOD_BEVERAGES;
    }
    
    private String[] getValidCategoryNames() {
        return java.util.Arrays.stream(ProductCategory.values())
                .map(Enum::name)
                .toArray(String[]::new);
    }

    private List<ProductDto> generateSampleProducts() {
        List<ProductDto> samples = new ArrayList<>();
        ProductCategory[] categories = ProductCategory.values();
        int counter = 1;

        for (ProductCategory category : categories) {
            ProductDto product = new ProductDto();
            product.setSku(String.format("%s%03d", category.name().substring(0, Math.min(4, category.name().length())).toUpperCase(), counter));
            product.setName(getSampleProductName(category));
            product.setDescription(getSampleDescription(category));
            product.setCategory(category);
            product.setQuantity(50 + (counter * 10));
            product.setUnitPrice(BigDecimal.valueOf(10.0 + (counter * 5.5)));
            product.setIsDamaged(false);
            product.setIsPerishable(isPerishableCategory(category));
            product.setExpiryDate(product.getIsPerishable() ? LocalDate.of(2024, 12, 31) : null);

            samples.add(product);
            counter++;
        }

        return samples;
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        // Check if product is referenced in any deliveries
        // This is a safety check to prevent deleting products that are part of deliveries
        boolean hasDeliveries = deliveryRepository.existsByItemsProductId(id);
        if (hasDeliveries) {
            throw new RuntimeException("Cannot delete product '" + product.getName() +
                                      "' because it is referenced in existing deliveries. Please remove it from all deliveries first.");
        }

        // Delete all inventory movements for this product first
        List<InventoryMovement> movements = movementRepository.findByProductId(id);
        if (!movements.isEmpty()) {
            movementRepository.deleteAll(movements);
        }

        // Now delete the product
        productRepository.deleteById(id);
    }

    public List<String> getAllSkus() {
        return productRepository.findAllSkus();
    }

    public List<String> getAllDeliveryAgents() {
        return deliveryRepository.findAllDeliveryAgents();
    }

    
    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setSku(product.getSku());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setCategory(product.getCategory());
        dto.setQuantity(product.getQuantity());
        dto.setUnitPrice(product.getUnitPrice());
        dto.setIsDamaged(product.getIsDamaged());
        dto.setIsPerishable(product.getIsPerishable());
        dto.setExpiryDate(product.getExpiryDate());
        return dto;
    }
    
    private Product convertToEntity(ProductDto dto) {
        Product product = new Product();
        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setCategory(dto.getCategory());
        product.setQuantity(dto.getQuantity());
        product.setUnitPrice(dto.getUnitPrice());
        product.setIsDamaged(dto.getIsDamaged());
        product.setIsPerishable(dto.getIsPerishable());
        product.setExpiryDate(dto.getExpiryDate());
        return product;
    }
    
    private InventoryMovementDto convertMovementToDto(InventoryMovement movement) {
        InventoryMovementDto dto = new InventoryMovementDto();
        dto.setId(movement.getId());
        dto.setProductSku(movement.getProduct().getSku());
        dto.setProductName(movement.getProduct().getName());
        dto.setMovementType(movement.getMovementType());
        dto.setQuantity(movement.getQuantity());
        dto.setReason(movement.getReason());
        dto.setReference(movement.getReference());
        dto.setMovementDate(movement.getMovementDate());
        dto.setPerformedBy(movement.getPerformedBy());
        return dto;
    }
}