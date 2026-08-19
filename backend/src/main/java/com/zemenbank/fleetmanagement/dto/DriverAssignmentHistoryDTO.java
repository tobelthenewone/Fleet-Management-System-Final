package com.zemenbank.fleetmanagement.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DriverAssignmentHistoryDTO {
    private Long id;
    private Long vehicleId;
    private String vehiclePlateNumber;
    private Long driverId;
    private String driverName;
    private String driverLicenseNumber;
    private LocalDateTime assignedAt;
    private String action;
    private String notes;
} 