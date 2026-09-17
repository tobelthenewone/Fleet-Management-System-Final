package com.zemenbank.fleetmanagement.dto.report;


public record DriverPerformanceReport(
    Long driverId,
    String driverName,
    Long completedTripCount
) {}


