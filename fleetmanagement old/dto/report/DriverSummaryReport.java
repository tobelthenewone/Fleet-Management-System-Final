package com.zemenbank.fleetmanagement.dto.report;

import lombok.*;

import java.util.Date;
import java.util.Map;

import com.zemenbank.fleetmanagement.enums.JourneyStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverSummaryReport {
    private Long driverId;
    private String name;
    private String licenseNumber;
    private String email;
    private Boolean isOccupied;
    private String licenseLevel;
    private Long vehicleId;

    private Long totalJourneys;
    private Double totalDistance;
    private Double avgDistancePerJourney;
    private Date lastJourneyDate;

    private Map<JourneyStatus, Long> journeyStatusCounts;
}