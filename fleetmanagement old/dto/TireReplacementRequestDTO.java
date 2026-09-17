// TireReplacementRequestDTO.java
package com.zemenbank.fleetmanagement.dto;

import com.zemenbank.fleetmanagement.enums.TirePosition;
import com.zemenbank.fleetmanagement.enums.TireStatus;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TireReplacementRequestDTO {
    private Long id;
    private Long requesterId;
    private UserBriefDTO requester;

    private Long verifiedById;
    private UserBriefDTO verifiedBy;

    private Long approvedById;
    private UserBriefDTO approvedBy;

    private Long rejectedById;
    private UserBriefDTO rejectedBy;

    private Long vehicleId;
    private VehicleDTO vehicle;
    private LocalDate dateOfRequest;
    private LocalDate oldTireMountDate;
    private String oldTireBrand;
    private String oldTireSerialNumber;
    private TirePosition tirePosition;
    private int odometerAtMounting;
    private int currentOdometer;
    private String reasonForReplacement;
    private TireStatus status;
    private String newTireBrand;
    private String newTireSerialNumber;
    private LocalDate newTireMountDate;
    private int odometerAtReplacement;
    private Long replacedById;
    private UserBriefDTO replacedBy;

}
