 package com.dlvery.dlvery.service;
 
 import com.dlvery.dlvery.dto.ProductDto;
 import com.dlvery.dlvery.entity.ProductCategory;
 import lombok.RequiredArgsConstructor;
 import org.apache.poi.ss.usermodel.*;
 import org.apache.poi.xssf.usermodel.XSSFWorkbook;
 import org.springframework.stereotype.Service;
 import org.springframework.web.multipart.MultipartFile;
 
 import java.io.IOException;
 import java.math.BigDecimal;
 import java.time.LocalDate;
 import java.time.format.DateTimeFormatter;
 import java.time.format.DateTimeParseException;
 import java.util.ArrayList;
 import java.util.List;

@Service
@RequiredArgsConstructor
public class FileUploadService {
    
    private final InventoryService inventoryService;
    
     public String processInventoryFile(MultipartFile file) {
         try {
             List<ProductDto> products = parseXLSXFile(file);
             int successCount = 0;
             int errorCount = 0;
             
             for (ProductDto product : products) {
                 try {
                     inventoryService.createProduct(product);
                     successCount++;
                 } catch (Exception e) {
                     errorCount++;
                     // Log error for specific product
                 }
             }
             
             return String.format("File processed successfully. %d products created, %d errors.", 
                                successCount, errorCount);
             
         } catch (Exception e) {
             throw new RuntimeException("Error processing file: " + e.getMessage());
         }
     }
    
     private List<ProductDto> parseXLSXFile(MultipartFile file) throws IOException {
         List<ProductDto> products = new ArrayList<>();
         
         try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
             Sheet sheet = workbook.getSheetAt(0); // Use first sheet
             boolean isFirstRow = true;
             int rowNumber = 0;
             
             for (Row row : sheet) {
                 rowNumber++;
                 
                 if (isFirstRow) {
                     isFirstRow = false;
                     continue; // Skip header
                 }
                 
                 // Skip empty rows
                 if (row == null || row.getLastCellNum() == 0) {
                     continue;
                 }
                 
                 try {
                     ProductDto product = parseProductFromRow(row, rowNumber);
                     products.add(product);
                 } catch (Exception e) {
                     throw new RuntimeException("Error parsing row " + rowNumber + ": " + e.getMessage());
                 }
             }
         }
         
         if (products.isEmpty()) {
             throw new RuntimeException("No valid products found in the XLSX file");
         }
         
         return products;
     }
     
     private String getCellValueAsString(Cell cell) {
         if (cell == null) {
             return "";
         }
         switch (cell.getCellType()) {
             case STRING:
                 return cell.getStringCellValue();
             case NUMERIC:
                 if (DateUtil.isCellDateFormatted(cell)) {
                     return cell.getDateCellValue().toString();
                 } else {
                     return String.valueOf((int) cell.getNumericCellValue());
                 }
             case BOOLEAN:
                 return String.valueOf(cell.getBooleanCellValue());
             case FORMULA:
                 return cell.getCellFormula();
             default:
                 return "";
         }
     }
    
    private String[] getValidCategories() {
        return java.util.Arrays.stream(ProductCategory.values())
                .map(Enum::name)
                .toArray(String[]::new);
    }
    
    private LocalDate parseDate(String dateStr) throws DateTimeParseException {
        // List of supported date formats
        DateTimeFormatter[] formatters = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),    // 2024-12-31
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),    // 31-12-2024
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),    // 12/31/2024
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),    // 31/12/2024
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),    // 2024/12/31
            DateTimeFormatter.ofPattern("dd.MM.yyyy"),    // 31.12.2024
            DateTimeFormatter.ofPattern("yyyy.MM.dd")     // 2024.12.31
        };
        
        // Try each formatter until one works
        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException e) {
                // Continue to next formatter
            }
        }
        
        // If none worked, throw exception
        throw new DateTimeParseException("Unable to parse date: " + dateStr, dateStr, 0);
    }

    private ProductDto parseProductFromRow(Row row, int rowNumber) throws Exception {
        if (row.getLastCellNum() < 6) {
            throw new RuntimeException("Insufficient columns. Expected at least 6 columns (sku,name,description,category,quantity,unitPrice)");
        }

        ProductDto product = new ProductDto();

        // Parse required fields
        parseRequiredFields(product, row, rowNumber);

        // Parse optional fields
        parseOptionalFields(product, row);

        return product;
    }

    private void parseRequiredFields(ProductDto product, Row row, int rowNumber) throws Exception {
        // SKU validation
        String sku = getCellValueAsString(row.getCell(0)).trim();
        if (sku.isEmpty()) {
            throw new RuntimeException("SKU cannot be empty");
        }
        product.setSku(sku);

        // Name validation
        String name = getCellValueAsString(row.getCell(1)).trim();
        if (name.isEmpty()) {
            throw new RuntimeException("Product name cannot be empty");
        }
        product.setName(name);

        product.setDescription(getCellValueAsString(row.getCell(2)).trim());

        // Category validation
        String categoryStr = getCellValueAsString(row.getCell(3)).trim().toUpperCase().replace(" ", "_");
        try {
            ProductCategory category = ProductCategory.valueOf(categoryStr);
            product.setCategory(category);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category '" + getCellValueAsString(row.getCell(3)).trim() + "'. Valid categories: " +
                                       String.join(", ", getValidCategories()));
        }

        // Quantity validation
        try {
            int quantity = (int) row.getCell(4).getNumericCellValue();
            if (quantity < 0) {
                throw new RuntimeException("Quantity cannot be negative");
            }
            product.setQuantity(quantity);
        } catch (Exception e) {
            throw new RuntimeException("Invalid quantity. Must be a number");
        }

        // Unit price validation
        try {
            double price = row.getCell(5).getNumericCellValue();
            BigDecimal unitPrice = BigDecimal.valueOf(price);
            if (unitPrice.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Unit price cannot be negative");
            }
            product.setUnitPrice(unitPrice);
        } catch (Exception e) {
            throw new RuntimeException("Invalid unit price. Must be a number");
        }
    }

    private void parseOptionalFields(ProductDto product, Row row) throws Exception {
        // Is damaged
        if (row.getLastCellNum() > 6 && row.getCell(6) != null) {
            String isDamagedStr = getCellValueAsString(row.getCell(6)).trim();
            product.setIsDamaged(!isDamagedStr.isEmpty() && Boolean.parseBoolean(isDamagedStr));
        } else {
            product.setIsDamaged(false);
        }

        // Is perishable
        if (row.getLastCellNum() > 7 && row.getCell(7) != null) {
            String isPerishableStr = getCellValueAsString(row.getCell(7)).trim();
            product.setIsPerishable(!isPerishableStr.isEmpty() && Boolean.parseBoolean(isPerishableStr));
        } else {
            product.setIsPerishable(false);
        }

        // Expiry date
        if (row.getLastCellNum() > 8 && row.getCell(8) != null) {
            String expiryDateStr = getCellValueAsString(row.getCell(8)).trim();
            if (!expiryDateStr.isEmpty()) {
                try {
                    LocalDate expiryDate = parseDate(expiryDateStr);
                    product.setExpiryDate(expiryDate);
                } catch (Exception e) {
                    throw new RuntimeException("Invalid expiry date '" + expiryDateStr + "'. Supported formats: YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY, DD/MM/YYYY");
                }
            }
        }
    }
}