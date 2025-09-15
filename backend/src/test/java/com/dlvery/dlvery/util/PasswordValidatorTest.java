package com.dlvery.dlvery.util;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PasswordValidatorTest {

    @Autowired
    private PasswordValidator passwordValidator;

    @Test
    void testValidPassword() {
        String validPassword = "MySecurePass1!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(validPassword);
        System.out.println("Valid password errors: " + result.getErrors());
        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    void testPasswordTooShort() {
        String shortPassword = "Short1!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(shortPassword);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must be at least 8 characters long"));
    }

    @Test
    void testPasswordTooLong() {
        String longPassword = "A".repeat(129);
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(longPassword);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must not exceed 128 characters"));
    }

    @Test
    void testMissingUppercase() {
        String password = "mysecure123!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must contain at least one uppercase letter"));
    }

    @Test
    void testMissingLowercase() {
        String password = "MYSECURE123!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must contain at least one lowercase letter"));
    }

    @Test
    void testMissingDigit() {
        String password = "MySecurePassword!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must contain at least one digit"));
    }

    @Test
    void testMissingSpecialChar() {
        String password = "MySecure123";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password must contain at least one special character"));
    }

    @Test
    void testCommonPassword() {
        String password = "password123";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password is too common and easily guessable"));
    }

    @Test
    void testRepeatedCharacters() {
        String password = "MySecure123!!!!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password cannot contain more than 3 consecutive identical characters"));
    }

    @Test
    void testSequentialCharacters() {
        String password = "MySecure123abc";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePassword(password);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Password cannot contain 3 or more sequential characters"));
    }

    @Test
    void testPasswordMatch() {
        String password = "MySecurePass1!";
        String confirmPassword = "MySecurePass1!";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePasswordMatch(password, confirmPassword);
        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    void testPasswordMismatch() {
        String password = "MySecurePass1!";
        String confirmPassword = "MySecurePass1?";
        PasswordValidator.PasswordValidationResult result = passwordValidator.validatePasswordMatch(password, confirmPassword);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("Passwords do not match"));
    }
}