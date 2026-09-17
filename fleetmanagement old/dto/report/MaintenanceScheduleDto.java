package com.zemenbank.fleetmanagement.dto.report;

import java.time.LocalDate;

public record MaintenanceScheduleDto(
    String plateNumber,
    String type,
    LocalDate scheduledDate,
    Double kilometerInterval
) {}
