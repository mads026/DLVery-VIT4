package com.dlvery.dlvery.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAgentProfileDto {
    private Long id;
    private String email;
    private String phoneNumber;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private LocalDate dateOfBirth;
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String vehicleType;
    private String vehicleNumber;
    private String bankAccountNumber;
    private String bankName;
    private String ifscCode;
    private String profilePictureUrl;
    private String displayName; // Customizable display name
    private Boolean isProfileComplete;
    private Boolean isAvailable;
}
