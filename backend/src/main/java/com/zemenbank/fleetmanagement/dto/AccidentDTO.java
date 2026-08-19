package com.zemenbank.fleetmanagement.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccidentDTO {
    private Long id;

    @NotNull(message = "Accident date is required")
    private LocalDate accidentDate;

    @NotBlank(message = "Fault is required")
    private String fault;

    private String insuranceClaim;

    private String policeReport;

    private String remark;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
    
    private String vehiclePlateNumber;

    private LocalDateTime insuranceClaimedAt;
    private LocalDateTime policeReportedAt;
    private LocalDateTime insuranceSurveyedAt;
    private LocalDateTime repairedAt;
    private LocalDateTime releasedAt;
} 