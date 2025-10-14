package com.dlvery.dlvery.service;

import com.dlvery.dlvery.dto.DeliveryAgentProfileDto;
import com.dlvery.dlvery.entity.DeliveryAgentProfile;
import com.dlvery.dlvery.entity.User;
import com.dlvery.dlvery.entity.UserRole;
import com.dlvery.dlvery.exception.CustomExceptions.*;
import com.dlvery.dlvery.repository.DeliveryAgentProfileRepository;
import com.dlvery.dlvery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryAgentProfileService {

    private final DeliveryAgentProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DeliveryAgentProfileDto getProfileByUsername(String username) {
        log.info("Fetching profile for delivery agent: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));
        
        if (user.getRole() != UserRole.DL_TEAM) {
            throw new UnauthorizedException("User is not a delivery agent");
        }
        
        Optional<DeliveryAgentProfile> profileOpt = profileRepository.findByUser(user);
        
        if (profileOpt.isPresent()) {
            return convertToDto(profileOpt.get());
        } else {
            // Create empty profile for new user
            return createEmptyProfile(user);
        }
    }

    @Transactional
    public DeliveryAgentProfileDto createOrUpdateProfile(String username, DeliveryAgentProfileDto profileDto) {
        log.info("Creating/updating profile for delivery agent: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));
        
        if (user.getRole() != UserRole.DL_TEAM) {
            throw new UnauthorizedException("User is not a delivery agent");
        }
        
        DeliveryAgentProfile profile = profileRepository.findByUser(user)
                .orElse(new DeliveryAgentProfile());
        
        // Update profile fields
        profile.setUser(user);
        profile.setPhoneNumber(profileDto.getPhoneNumber());
        profile.setEmergencyContactName(profileDto.getEmergencyContactName());
        profile.setEmergencyContactPhone(profileDto.getEmergencyContactPhone());
        profile.setAddress(profileDto.getAddress());
        profile.setCity(profileDto.getCity());
        profile.setState(profileDto.getState());
        profile.setPostalCode(profileDto.getPostalCode());
        profile.setDateOfBirth(profileDto.getDateOfBirth());
        profile.setLicenseNumber(profileDto.getLicenseNumber());
        profile.setLicenseExpiryDate(profileDto.getLicenseExpiryDate());
        profile.setVehicleType(profileDto.getVehicleType());
        profile.setVehicleNumber(profileDto.getVehicleNumber());
        profile.setBankAccountNumber(profileDto.getBankAccountNumber());
        profile.setBankName(profileDto.getBankName());
        profile.setIfscCode(profileDto.getIfscCode());
        profile.setProfilePictureUrl(profileDto.getProfilePictureUrl());
        profile.setIsAvailable(profileDto.getIsAvailable() != null ? profileDto.getIsAvailable() : true);
        
        // Handle display name - only allow changes during first-time setup
        if (profile.getDisplayName() == null || !profile.getIsProfileComplete()) {
            // First time setup or profile not yet complete - allow display name change
            profile.setDisplayName(profileDto.getDisplayName() != null ? 
                profileDto.getDisplayName() : user.getFullName());
        }
        // If profile is already complete, display name cannot be changed
        
        // Check if profile is complete
        profile.setIsProfileComplete(isProfileComplete(profile));
        
        profile = profileRepository.save(profile);
        
        log.info("Profile saved for delivery agent: {} (Complete: {})", username, profile.getIsProfileComplete());
        
        return convertToDto(profile);
    }

    @Transactional(readOnly = true)
    public boolean isProfileComplete(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));
        
        Optional<DeliveryAgentProfile> profileOpt = profileRepository.findByUser(user);
        
        return profileOpt.map(DeliveryAgentProfile::getIsProfileComplete).orElse(false);
    }

    private boolean isProfileComplete(DeliveryAgentProfile profile) {
        return profile.getPhoneNumber() != null && !profile.getPhoneNumber().trim().isEmpty() &&
               profile.getAddress() != null && !profile.getAddress().trim().isEmpty() &&
               profile.getCity() != null && !profile.getCity().trim().isEmpty() &&
               profile.getState() != null && !profile.getState().trim().isEmpty() &&
               profile.getDateOfBirth() != null &&
               profile.getLicenseNumber() != null && !profile.getLicenseNumber().trim().isEmpty() &&
               profile.getVehicleType() != null && !profile.getVehicleType().trim().isEmpty() &&
               profile.getVehicleNumber() != null && !profile.getVehicleNumber().trim().isEmpty();
    }

    private DeliveryAgentProfileDto createEmptyProfile(User user) {
        DeliveryAgentProfileDto dto = new DeliveryAgentProfileDto();
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getFullName()); // Default to Google name, but editable on first setup
        dto.setIsProfileComplete(false);
        dto.setIsAvailable(true);
        return dto;
    }

    private DeliveryAgentProfileDto convertToDto(DeliveryAgentProfile profile) {
        DeliveryAgentProfileDto dto = new DeliveryAgentProfileDto();
        dto.setId(profile.getId());
        dto.setEmail(profile.getUser().getEmail());
        dto.setDisplayName(profile.getDisplayName()); // Customizable display name
        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setEmergencyContactName(profile.getEmergencyContactName());
        dto.setEmergencyContactPhone(profile.getEmergencyContactPhone());
        dto.setAddress(profile.getAddress());
        dto.setCity(profile.getCity());
        dto.setState(profile.getState());
        dto.setPostalCode(profile.getPostalCode());
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setLicenseNumber(profile.getLicenseNumber());
        dto.setLicenseExpiryDate(profile.getLicenseExpiryDate());
        dto.setVehicleType(profile.getVehicleType());
        dto.setVehicleNumber(profile.getVehicleNumber());
        dto.setBankAccountNumber(profile.getBankAccountNumber());
        dto.setBankName(profile.getBankName());
        dto.setIfscCode(profile.getIfscCode());
        dto.setProfilePictureUrl(profile.getProfilePictureUrl());
        dto.setIsProfileComplete(profile.getIsProfileComplete());
        dto.setIsAvailable(profile.getIsAvailable());
        return dto;
    }
}
