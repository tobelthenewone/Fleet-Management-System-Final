package com.zemenbank.fleetmanagement.dto.report;

public record DriverStatusDistribution(
        long totalDrivers,
        long occupiedDrivers,
        long availableDrivers
) {}
