package com.zemenbank.fleetmanagement.dto;
import lombok.*;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class InsurancePolicyDTO {
    private Long id;
    private String policyNumber;
    private String provider;
    private LocalDate startDate;
    private LocalDate endDate;
    private double premiumAmount;
    private String coverageType;
    private Long vehicleId;
    private String plateNumber;
}
