package com.zemenbank.fleetmanagement.dto.report;



public record DriverActivityReport(
    Long driverId,
    String driverName,
    Long totalRequests,
    Long completedRequests
) {}

