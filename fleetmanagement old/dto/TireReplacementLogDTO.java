package com.zemenbank.fleetmanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TireReplacementLogDTO {
    private Long id;
    private String plateNumber;
    private Long vehicleId;
    private Long requestId;

    private String newTireBrand;
    private String newTireSerialNumber;
    private LocalDate newTireMountDate;

    private String oldTireBrand;
    private String oldTireSerialNumber;
    private LocalDate oldTireMountDate;

    private int odometerAtReplacement;
    private LocalDate dateOfReplacement;
    private UserBriefDTO replacedBy;
    private Long replacedById;

}
