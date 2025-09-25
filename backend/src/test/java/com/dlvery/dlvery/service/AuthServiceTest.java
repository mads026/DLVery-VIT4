package com.dlvery.dlvery.service;

import com.dlvery.dlvery.dto.LoginRequest;
import com.dlvery.dlvery.dto.RegisterRequest;
import com.dlvery.dlvery.dto.AuthResponse;
import com.dlvery.dlvery.entity.User;
import com.dlvery.dlvery.entity.UserRole;
import com.dlvery.dlvery.entity.AuthProvider;
import com.dlvery.dlvery.repository.UserRepository;
import com.dlvery.dlvery.util.JwtUtil;
import com.dlvery.dlvery.util.PasswordValidator;
import com.dlvery.dlvery.exception.CustomExceptions;
import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Authentication Service Tests")
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordValidator passwordValidator;

    @Mock
    private EmailVerificationService emailVerificationService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword");
        testUser.setRole(UserRole.INV_TEAM);
        testUser.setOauthProvider(AuthProvider.LOCAL);
        testUser.setIsActive(true);
        testUser.setEmailVerified(true);

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("newuser");
        registerRequest.setEmail("newuser@example.com");
        registerRequest.setPassword("SecurePass123!");
        registerRequest.setConfirmPassword("SecurePass123!");
        registerRequest.setFullName("New User");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("SecurePass123!");
    }

    @Test
    @DisplayName("Should register user successfully")
    void testRegisterSuccess() {
        // Mock password validation
        PasswordValidator.PasswordValidationResult validationResult = 
            new PasswordValidator.PasswordValidationResult(true, Collections.emptyList());
        when(passwordValidator.validatePassword(anyString())).thenReturn(validationResult);
        
        PasswordValidator.PasswordValidationResult matchResult = 
            new PasswordValidator.PasswordValidationResult(true, Collections.emptyList());
        when(passwordValidator.validatePasswordMatch(anyString(), anyString())).thenReturn(matchResult);

        // Mock repository calls
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        AuthResponse response = authService.registerInventoryTeam(registerRequest);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals(UserRole.INV_TEAM, response.getRole());

        verify(userRepository).save(any(User.class));
        verify(emailVerificationService).sendVerificationEmail(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when username already exists")
    void testRegisterUsernameExists() {
        // Mock password validation to pass
        PasswordValidator.PasswordValidationResult validationResult = 
            new PasswordValidator.PasswordValidationResult(true, Collections.emptyList());
        when(passwordValidator.validatePassword(anyString())).thenReturn(validationResult);
        
        PasswordValidator.PasswordValidationResult matchResult = 
            new PasswordValidator.PasswordValidationResult(true, Collections.emptyList());
        when(passwordValidator.validatePasswordMatch(anyString(), anyString())).thenReturn(matchResult);

        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        assertThrows(CustomExceptions.UserAlreadyExistsException.class, () -> {
            authService.registerInventoryTeam(registerRequest);
        });
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void testRegisterEmailExists() {
        // Mock password validation to pass
        PasswordValidator.PasswordValidationResult validationResult = 
            new PasswordValidator.PasswordValidationResult(true, Collections.emptyList());
        when(passwordValidator.validatePassword(anyString())).thenReturn(validationResult);
        
        PasswordValidator.PasswordValidationResult matchResult = 
            new PasswordValidator.PasswordValidationResult(true, Collections.emptyList());
        when(passwordValidator.validatePasswordMatch(anyString(), anyString())).thenReturn(matchResult);

        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(CustomExceptions.UserAlreadyExistsException.class, () -> {
            authService.registerInventoryTeam(registerRequest);
        });
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testLoginSuccess() {
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getPrincipal()).thenReturn(testUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(mockAuth);
        when(jwtUtil.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.authenticateInventoryTeam(loginRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("testuser", response.getUsername());
        assertEquals(UserRole.INV_TEAM, response.getRole());
    }

    @Test
    @DisplayName("Should throw exception for invalid role")
    void testLoginInvalidRole() {
        testUser.setRole(UserRole.DL_TEAM); // Wrong role
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getPrincipal()).thenReturn(testUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(mockAuth);

        assertThrows(CustomExceptions.InvalidRoleException.class, () -> {
            authService.authenticateInventoryTeam(loginRequest);
        });
    }

    @Test
    @DisplayName("Should throw exception for unverified email")
    void testLoginUnverifiedEmail() {
        testUser.setEmailVerified(false);
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getPrincipal()).thenReturn(testUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(mockAuth);

        assertThrows(CustomExceptions.EmailNotVerifiedException.class, () -> {
            authService.authenticateInventoryTeam(loginRequest);
        });
    }
}