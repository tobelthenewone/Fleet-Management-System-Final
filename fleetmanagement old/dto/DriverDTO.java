package com.zemenbank.fleetmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class DriverDTO {

        private Long id;

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "License number is required")
        private String licenseNumber;

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
        private String phoneNumber;
        
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private Boolean isOccupied;

        @NotBlank(message = "License level is required")
        @Pattern(regexp = "^[1-4]$", message = "License level must be between 1 and 4")
        private String licenseLevel;

        private Long vehicleId; // Optional, can be null if driver is not assigned to a vehicle

        private String imageUrl;
    }