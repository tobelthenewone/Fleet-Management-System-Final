package com.zemenbank.fleetmanagement.dto.report;

import java.time.LocalDateTime;

public record InactiveDriverReport(
    Long driverId,
    String driverName,
    LocalDateTime lastUpdated
) {}
