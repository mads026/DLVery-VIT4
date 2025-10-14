package com.dlvery.dlvery.exception;

import com.dlvery.dlvery.dto.AuthResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomExceptions.AuthenticationFailedException.class)
    public ResponseEntity<AuthResponse> handleAuthenticationFailed(CustomExceptions.AuthenticationFailedException ex) {
        AuthResponse response = new AuthResponse(null, null, null, null, ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(CustomExceptions.UserAlreadyExistsException.class)
    public ResponseEntity<AuthResponse> handleUserAlreadyExists(CustomExceptions.UserAlreadyExistsException ex) {
        AuthResponse response = new AuthResponse(null, null, null, null, ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(CustomExceptions.EmailNotVerifiedException.class)
    public ResponseEntity<AuthResponse> handleEmailNotVerified(CustomExceptions.EmailNotVerifiedException ex) {
        AuthResponse response = new AuthResponse(null, null, null, null, ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(CustomExceptions.InvalidRoleException.class)
    public ResponseEntity<AuthResponse> handleInvalidRole(CustomExceptions.InvalidRoleException ex) {
        AuthResponse response = new AuthResponse(null, null, null, null, ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(CustomExceptions.ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFound(CustomExceptions.ResourceNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(CustomExceptions.InvalidPasswordException.class)
    public ResponseEntity<AuthResponse> handleInvalidPassword(CustomExceptions.InvalidPasswordException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new AuthResponse(null, null, null, null, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<AuthResponse> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(null, null, null, null, "Invalid credentials"));
    }

    @ExceptionHandler(CustomExceptions.DeliveryNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleDeliveryNotFound(CustomExceptions.DeliveryNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("type", "DELIVERY_NOT_FOUND");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(CustomExceptions.ProductNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleProductNotFound(CustomExceptions.ProductNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("type", "PRODUCT_NOT_FOUND");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(CustomExceptions.InsufficientStockException.class)
    public ResponseEntity<Map<String, String>> handleInsufficientStock(CustomExceptions.InsufficientStockException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("type", "INSUFFICIENT_STOCK");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(CustomExceptions.InvalidDeliveryStatusException.class)
    public ResponseEntity<Map<String, String>> handleInvalidDeliveryStatus(CustomExceptions.InvalidDeliveryStatusException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("type", "INVALID_DELIVERY_STATUS");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(CustomExceptions.DeliveryProcessingException.class)
    public ResponseEntity<Map<String, String>> handleDeliveryProcessing(CustomExceptions.DeliveryProcessingException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("type", "DELIVERY_PROCESSING_ERROR");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(
            org.springframework.dao.DataIntegrityViolationException ex) {
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        
        // Log the full error for debugging
        System.err.println("DataIntegrityViolationException: " + message);
        ex.printStackTrace();
        
        // Handle duplicate key errors
        if (message != null && message.contains("Duplicate entry")) {
            if (message.contains("products.UKfhmd06dsmj6k0n90swsh8ie9g")) {
                error.put("error", "A product with this SKU already exists. This should not happen with auto-generation. Please contact support.");
                error.put("type", "DUPLICATE_SKU");
            } else {
                error.put("error", "This record already exists in the database.");
                error.put("type", "DUPLICATE_ENTRY");
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        
        // Handle NULL constraint violations
        if (message != null && (message.contains("cannot be null") || message.contains("Column 'sku' cannot be null"))) {
            error.put("error", "SKU generation failed. Please ensure a category is selected and try again.");
            error.put("type", "NULL_CONSTRAINT");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
        
        // Handle data truncation errors
        if (message != null && message.contains("Data truncation")) {
            error.put("error", "Data is too large for the database field. Please reduce the size.");
            error.put("type", "DATA_TOO_LARGE");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
        
        // Generic constraint violation with more details
        error.put("error", "Database constraint violation: " + (message != null ? message.substring(0, Math.min(200, message.length())) : "Unknown error"));
        error.put("type", "DATA_INTEGRITY_VIOLATION");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        
        // Use the exception message directly for RuntimeExceptions
        // This will catch our custom "Product with SKU 'xxx' already exists" message
        String message = ex.getMessage();
        if (message != null && !message.isEmpty()) {
            error.put("error", message);
            
            // Determine type based on message content
            if (message.toLowerCase().contains("already exists")) {
                error.put("type", "ALREADY_EXISTS");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            } else if (message.toLowerCase().contains("not found")) {
                error.put("type", "NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            } else {
                error.put("type", "RUNTIME_ERROR");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
        
        error.put("error", "An error occurred while processing your request");
        error.put("type", "RUNTIME_ERROR");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "An unexpected error occurred");
        error.put("type", "GENERIC_ERROR");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}