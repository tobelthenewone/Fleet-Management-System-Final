package com.zemenbank.fleetmanagement.dto.report;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleReportDTO {

    private Long vehicleId;
    private String plateNumber;
    private String model;
    private String manufacturer;
    private int yearOfMade;

    private double totalDistance;
    private double totalFuelConsumed;
    private double totalFuelCost;
    private double totalMaintenanceCost;

    private Long totalJourneys;         // performance
    private Long totalMaintenances;     // number of times maintained
    private Long totalFuelLogs;         // number of times refueled
    private int totalAccidents;

    private LocalDateTime reportStartDate;
    private LocalDateTime reportEndDate;
}
