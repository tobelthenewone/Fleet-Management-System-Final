package com.zemenbank.fleetmanagement.dto.report;

import java.time.LocalDateTime;

public record VehicleStatusReportDto(
    String plateNumber,
    String type,
    LocalDateTime lastAssignment,
    Long daysSinceLastAssignment,
    String maintenanceStatus
) {}

