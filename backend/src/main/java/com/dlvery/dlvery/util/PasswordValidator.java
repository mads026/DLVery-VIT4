package com.dlvery.dlvery.util;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class PasswordValidator {
    
    // Password validation patterns
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]");
    
    // Password constraints
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MAX_PASSWORD_LENGTH = 128;
    
    // Common weak passwords to reject
    private static final String[] COMMON_WEAK_PASSWORDS = {
        "password", "123456", "password123", "admin", "qwerty", 
        "letmein", "welcome", "monkey", "1234567890", "password1"
    };
    
    public PasswordValidationResult validatePassword(String password) {
        List<String> errors = new ArrayList<>();
        
        if (password == null || password.isEmpty()) {
            errors.add("Password is required");
            return new PasswordValidationResult(false, errors);
        }
        
        // Length validation
        if (password.length() < MIN_PASSWORD_LENGTH) {
            errors.add("Password must be at least " + MIN_PASSWORD_LENGTH + " characters long");
        }
        
        if (password.length() > MAX_PASSWORD_LENGTH) {
            errors.add("Password must not exceed " + MAX_PASSWORD_LENGTH + " characters");
        }
        
        // Character type validation
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one uppercase letter");
        }
        
        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one lowercase letter");
        }
        
        if (!DIGIT_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one digit");
        }
        
        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one special character");
        }
        
        // Check for common weak passwords
        String lowerPassword = password.toLowerCase();
        for (String weakPassword : COMMON_WEAK_PASSWORDS) {
            if (lowerPassword.equals(weakPassword)) {
                errors.add("Password is too common and easily guessable");
                break;
            }
        }
        
        // Check for repeated characters (more than 3 consecutive)
        if (hasRepeatedCharacters(password, 3)) {
            errors.add("Password cannot contain more than 3 consecutive identical characters");
        }
        
        // Check for sequential characters (like 123 or abc)
        if (hasSequentialCharacters(password, 3)) {
            errors.add("Password cannot contain 3 or more sequential characters");
        }
        
        return new PasswordValidationResult(errors.isEmpty(), errors);
    }
    
    public PasswordValidationResult validatePasswordMatch(String password, String confirmPassword) {
        List<String> errors = new ArrayList<>();
        
        if (password == null || confirmPassword == null) {
            errors.add("Both password and confirmation are required");
            return new PasswordValidationResult(false, errors);
        }
        
        if (!password.equals(confirmPassword)) {
            errors.add("Passwords do not match");
        }
        
        return new PasswordValidationResult(errors.isEmpty(), errors);
    }
    
    private boolean hasRepeatedCharacters(String password, int maxRepeats) {
        for (int i = 0; i <= password.length() - maxRepeats; i++) {
            boolean isRepeated = true;
            char currentChar = password.charAt(i);

            for (int j = 1; j < maxRepeats; j++) {
                if (password.charAt(i + j) != currentChar) {
                    isRepeated = false;
                    break;
                }
            }

            if (isRepeated) return true;
        }

        return false;
    }
    
    private boolean hasSequentialCharacters(String password, int minSequence) {
        for (int i = 0; i <= password.length() - minSequence; i++) {
            boolean isAscending = true;
            boolean isDescending = true;

            for (int j = 1; j < minSequence; j++) {
                char current = password.charAt(i + j - 1);
                char next = password.charAt(i + j);

                if (next != current + 1) isAscending = false;
                if (next != current - 1) isDescending = false;
            }

            if (isAscending || isDescending) return true;
        }

        return false;
    }
    
    public static class PasswordValidationResult {
        private final boolean valid;
        private final List<String> errors;
        
        public PasswordValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public List<String> getErrors() {
            return errors;
        }
        
        public String getMessage() {
            return String.join("; ", errors);
        }
    }
}