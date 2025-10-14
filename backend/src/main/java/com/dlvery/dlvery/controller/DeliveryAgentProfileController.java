package com.dlvery.dlvery.controller;

import com.dlvery.dlvery.dto.DeliveryAgentProfileDto;
import com.dlvery.dlvery.service.DeliveryAgentProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/delivery-agent/profile")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Delivery Agent Profile", description = "Profile management for delivery agents")
@PreAuthorize("hasRole('DL_TEAM')")
public class DeliveryAgentProfileController {

    private final DeliveryAgentProfileService profileService;

    @GetMapping
    @Operation(summary = "Get delivery agent profile", description = "Get the profile of the authenticated delivery agent")
    public ResponseEntity<DeliveryAgentProfileDto> getProfile(Authentication authentication) {
        log.info("Fetching profile for delivery agent: {}", authentication.getName());
        
        DeliveryAgentProfileDto profile = profileService.getProfileByUsername(authentication.getName());
        
        return ResponseEntity.ok(profile);
    }

    @PostMapping
    @Operation(summary = "Create or update profile", description = "Create or update the profile of the authenticated delivery agent")
    public ResponseEntity<DeliveryAgentProfileDto> createOrUpdateProfile(
            @Valid @RequestBody DeliveryAgentProfileDto profileDto,
            Authentication authentication) {
        
        log.info("Creating/updating profile for delivery agent: {}", authentication.getName());
        
        DeliveryAgentProfileDto updatedProfile = profileService.createOrUpdateProfile(
                authentication.getName(), profileDto);
        
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/complete")
    @Operation(summary = "Check if profile is complete", description = "Check if the delivery agent's profile is complete")
    public ResponseEntity<Boolean> isProfileComplete(Authentication authentication) {
        log.info("Checking profile completeness for delivery agent: {}", authentication.getName());
        
        boolean isComplete = profileService.isProfileComplete(authentication.getName());
        
        return ResponseEntity.ok(isComplete);
    }
}