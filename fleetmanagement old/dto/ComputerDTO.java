package com.zemenbank.fleetmanagement.dto;

import com.zemenbank.fleetmanagement.enums.OwnershipType;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComputerDTO {
    @Id
    private Long id;
    private String ownerName;
    private String serialNumber;
    private String model;
    private OwnershipType ownershipType;
    private String qrCode;
    // ISO 8601 format
}
    

