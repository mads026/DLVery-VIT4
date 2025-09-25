package com.dlvery.dlvery.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Password Validator Tests")
class PasswordValidatorTest {

    private PasswordValidator passwordValidator;

    @BeforeEach
    void setUp() {
        passwordValidator = new PasswordValidator();
    }

    @Test
    @DisplayName("Should validate correct password")
    void testValidPassword() {
        String validPassword = "MySecurePass1!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(validPassword);
        
        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    @DisplayName("Should reject password that is too short")
    void testPasswordTooShort() {
        String shortPassword = "Short1!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(shortPassword);
        
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must be at least 8 characters long"));
    }

    @Test
    @DisplayName("Should reject password that is too long")
    void testPasswordTooLong() {
        String longPassword = "A".repeat(129);
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(longPassword);
        
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must not exceed 128 characters"));
    }

    @Test
    @DisplayName("Should reject password missing uppercase letter")
    void testMissingUppercase() {
        String password = "mysecure123!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must contain at least one uppercase letter"));
    }

    @Test
    @DisplayName("Should reject password missing lowercase letter")
    void testMissingLowercase() {
        String password = "MYSECURE123!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must contain at least one lowercase letter"));
    }

    @Test
    @DisplayName("Should reject password missing digit")
    void testMissingDigit() {
        String password = "MySecurePassword!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must contain at least one digit"));
    }

    @Test
    @DisplayName("Should reject password missing special character")
    void testMissingSpecialChar() {
        String password = "MySecure123";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must contain at least one special character"));
    }

    @Test
    @DisplayName("Should validate matching passwords")
    void testPasswordMatch() {
        String password = "MySecurePass1!";
        String confirmPassword = "MySecurePass1!";
        
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePasswordMatch(password, confirmPassword);
        assertTrue(result.isValid());
    }

    @Test
    @DisplayName("Should reject non-matching passwords")
    void testPasswordMismatch() {
        String password = "MySecurePass1!";
        String confirmPassword = "MySecurePass1?";
        
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePasswordMatch(password, confirmPassword);
        assertFalse(result.isValid());
    }

    @Test
    @DisplayName("Should handle null password")
    void testNullPassword() {
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(null);
        
        assertFalse(result.isValid());
        assertFalse(result.getErrors().isEmpty());
    }

    @Test
    @DisplayName("Should handle empty password")
    void testEmptyPassword() {
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword("");
        
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password is required"));
    }
}