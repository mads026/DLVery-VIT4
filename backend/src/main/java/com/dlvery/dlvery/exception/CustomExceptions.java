package com.dlvery.dlvery.exception;

public class CustomExceptions {
    
    public static class AuthenticationFailedException extends RuntimeException {
        public AuthenticationFailedException(String message) {
            super(message);
        }
    }
    
    public static class UserAlreadyExistsException extends RuntimeException {
        public UserAlreadyExistsException(String message) {
            super(message);
        }
    }
    
    public static class EmailNotVerifiedException extends RuntimeException {
        public EmailNotVerifiedException(String message) {
            super(message);
        }
    }
    
    public static class InvalidRoleException extends RuntimeException {
        public InvalidRoleException(String message) {
            super(message);
        }
    }
    
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }
    
    public static class InvalidPasswordException extends RuntimeException {
        public InvalidPasswordException(String message) {
            super(message);
        }
    }

    // Delivery-specific exceptions
    public static class DeliveryNotFoundException extends RuntimeException {
        public DeliveryNotFoundException(String message) {
            super(message);
        }

        public DeliveryNotFoundException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static class ProductNotFoundException extends RuntimeException {
        public ProductNotFoundException(String message) {
            super(message);
        }

        public ProductNotFoundException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static class InsufficientStockException extends RuntimeException {
        public InsufficientStockException(String message) {
            super(message);
        }

        public InsufficientStockException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static class InvalidDeliveryStatusException extends RuntimeException {
        public InvalidDeliveryStatusException(String message) {
            super(message);
        }

        public InvalidDeliveryStatusException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static class DeliveryProcessingException extends RuntimeException {
        public DeliveryProcessingException(String message) {
            super(message);
        }

        public DeliveryProcessingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}