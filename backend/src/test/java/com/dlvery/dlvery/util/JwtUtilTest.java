package com.dlvery.dlvery.util;

import com.dlvery.dlvery.entity.User;
import com.dlvery.dlvery.entity.UserRole;
import com.dlvery.dlvery.entity.AuthProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("JWT Utility Tests")
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "testSecretKeyThatIsLongEnoughForHS256Algorithm");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L); // 24 hours

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.INV_TEAM);
        testUser.setOauthProvider(AuthProvider.LOCAL);
    }

    @Test
    @DisplayName("Should generate valid JWT token")
    void testGenerateToken() {
        String token = jwtUtil.generateToken(testUser);
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts separated by dots
    }

    @Test
    @DisplayName("Should extract username from token")
    void testExtractUsername() {
        String token = jwtUtil.generateToken(testUser);
        String extractedUsername = jwtUtil.extractUsername(token);
        
        assertEquals(testUser.getUsername(), extractedUsername);
    }

    @Test
    @DisplayName("Should validate token correctly")
    void testValidateToken() {
        String token = jwtUtil.generateToken(testUser);
        
        assertTrue(jwtUtil.validateToken(token, testUser));
    }

    @Test
    @DisplayName("Should detect expired token")
    void testExpiredToken() {
        // Set very short expiration for testing
        ReflectionTestUtils.setField(jwtUtil, "expiration", -1000L); // Already expired
        
        String token = jwtUtil.generateToken(testUser);
        
        // Token should be invalid due to expiration
        assertThrows(Exception.class, () -> {
            jwtUtil.validateToken(token, testUser);
        });
    }

    @Test
    @DisplayName("Should reject invalid token")
    void testInvalidToken() {
        String invalidToken = "invalid.token.here";
        
        assertThrows(Exception.class, () -> {
            jwtUtil.validateToken(invalidToken, testUser);
        });
    }
}