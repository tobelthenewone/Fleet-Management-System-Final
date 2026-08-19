package com.zemenbank.fleetmanagement.dto.report;

import java.time.LocalDateTime;

import com.zemenbank.fleetmanagement.enums.VehicleStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverDetailReport {
    private Long id;
    private String name;
    private VehicleStatus status;
    private Double performanceScore;
    private LocalDateTime createdAt;
}