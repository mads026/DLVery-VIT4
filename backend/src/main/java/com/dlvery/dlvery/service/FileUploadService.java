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
             int rowNumber = 0;
             int headerRowIndex = -1;
             
             // Find the header row (skip info rows)
             for (Row row : sheet) {
                 if (row == null) continue;
                 
                 Cell firstCell = row.getCell(0);
                 if (firstCell != null) {
                     String firstCellValue = getCellValueAsString(firstCell).trim().toLowerCase();
                     // Check if this is the header row
                     if (firstCellValue.equals("name") || firstCellValue.equals("sku")) {
                         headerRowIndex = row.getRowNum();
                         break;
                     }
                 }
             }
             
             if (headerRowIndex == -1) {
                 throw new RuntimeException("Header row not found. Expected 'name' or 'sku' in first column.");
             }
             
             // Parse data rows
             for (Row row : sheet) {
                 rowNumber = row.getRowNum() + 1; // 1-based for user display
                 
                 // Skip rows before or at header
                 if (row.getRowNum() <= headerRowIndex) {
                     continue;
                 }
                 
                 // Skip empty rows
                 if (row == null || row.getLastCellNum() == 0) {
                     continue;
                 }
                 
                 // Check if row is completely empty
                 boolean isEmpty = true;
                 for (int i = 0; i < row.getLastCellNum(); i++) {
                     Cell cell = row.getCell(i);
                     if (cell != null && !getCellValueAsString(cell).trim().isEmpty()) {
                         isEmpty = false;
                         break;
                     }
                 }
                 
                 if (isEmpty) {
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
        // Check minimum columns (without SKU: name, description, category, quantity, unitPrice = 5)
        if (row.getLastCellNum() < 5) {
            throw new RuntimeException("Insufficient columns. Expected at least 5 columns (name,description,category,quantity,unitPrice)");
        }

        ProductDto product = new ProductDto();

        // Parse required fields (SKU will be auto-generated)
        parseRequiredFields(product, row, rowNumber);

        // Parse optional fields
        parseOptionalFields(product, row);

        return product;
    }

    private void parseRequiredFields(ProductDto product, Row row, int rowNumber) throws Exception {
        // SKU is no longer in the file - it will be auto-generated based on category
        // Column indices shifted: 0=name, 1=description, 2=category, 3=quantity, 4=unitPrice

        // Name validation (column 0)
        String name = getCellValueAsString(row.getCell(0)).trim();
        if (name.isEmpty()) {
            throw new RuntimeException("Product name cannot be empty");
        }
        product.setName(name);

        // Description (column 1)
        product.setDescription(getCellValueAsString(row.getCell(1)).trim());

        // Category validation (column 2)
        String categoryStr = getCellValueAsString(row.getCell(2)).trim().toUpperCase().replace(" ", "_");
        try {
            ProductCategory category = ProductCategory.valueOf(categoryStr);
            product.setCategory(category);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category '" + getCellValueAsString(row.getCell(2)).trim() + "'. Valid categories: " +
                                       String.join(", ", getValidCategories()));
        }

        // Quantity validation (column 3)
        try {
            int quantity = (int) row.getCell(3).getNumericCellValue();
            if (quantity < 0) {
                throw new RuntimeException("Quantity cannot be negative");
            }
            product.setQuantity(quantity);
        } catch (Exception e) {
            throw new RuntimeException("Invalid quantity. Must be a number");
        }

        // Unit price validation (column 4)
        try {
            double price = row.getCell(4).getNumericCellValue();
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
        // Column indices without SKU: 5=isDamaged, 6=isPerishable, 7=expiryDate
        
        // Is damaged (column 5)
        if (row.getLastCellNum() > 5 && row.getCell(5) != null) {
            String isDamagedStr = getCellValueAsString(row.getCell(5)).trim();
            product.setIsDamaged(!isDamagedStr.isEmpty() && Boolean.parseBoolean(isDamagedStr));
        } else {
            product.setIsDamaged(false);
        }

        // Is perishable (column 6)
        if (row.getLastCellNum() > 6 && row.getCell(6) != null) {
            String isPerishableStr = getCellValueAsString(row.getCell(6)).trim();
            product.setIsPerishable(!isPerishableStr.isEmpty() && Boolean.parseBoolean(isPerishableStr));
        } else {
            product.setIsPerishable(false);
        }

        // Expiry date (column 7)
        if (row.getLastCellNum() > 7 && row.getCell(7) != null) {
            String expiryDateStr = getCellValueAsString(row.getCell(7)).trim();
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