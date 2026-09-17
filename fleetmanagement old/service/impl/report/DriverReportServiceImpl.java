package com.zemenbank.fleetmanagement.service.impl.report;

import com.zemenbank.fleetmanagement.dto.report.DriverSummaryReport;
import com.zemenbank.fleetmanagement.dto.report.InactiveDriverReport;
import com.zemenbank.fleetmanagement.dto.report.DriverActivityReport;
import com.zemenbank.fleetmanagement.dto.report.DriverPerformanceReport;
import com.zemenbank.fleetmanagement.dto.report.DriverStatusDistribution;
import com.zemenbank.fleetmanagement.model.Driver;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.model.Journey;
import com.zemenbank.fleetmanagement.enums.JourneyStatus;
import com.zemenbank.fleetmanagement.repository.DriverRepository;
import com.zemenbank.fleetmanagement.repository.JourneyRepository;
import com.zemenbank.fleetmanagement.service.report.DriverReportService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverReportServiceImpl implements DriverReportService {

    private final DriverRepository driverRepository;
    private final JourneyRepository journeyRepository;

    @Override
    public List<DriverSummaryReport> getDriverSummaries() {
        List<Driver> drivers = driverRepository.findAll();

        List<DriverSummaryReport> driverSummaryReports=new ArrayList<>();
        for(Driver driver:drivers){
            Vehicle vehicle = driver.getVehicle();
            Long vehicleId = vehicle != null ? vehicle.getId() : null;

            List<Journey> journeys = vehicleId != null
                    ? journeyRepository.findByVehicleId(vehicleId)
                    : Collections.emptyList();

            double totalDistance = journeys.stream()
                    .mapToDouble(j -> j.getDistance() != null ? j.getDistance() : 0.0)
                    .sum();

            long totalJourneys = journeys.size();
            double avgDistance = totalJourneys > 0 ? totalDistance / totalJourneys : 0;

            Date lastJourneyDate = journeys.stream()
                    .map(Journey::getStartTime)
                    .filter(Objects::nonNull)
                    .map(start -> Date.from(start.atZone(ZoneId.systemDefault()).toInstant()))
                    .max(Date::compareTo)
                    .orElse(null);

            Map<JourneyStatus, Long> journeyStatusCounts = journeys.stream()
                    .collect(Collectors.groupingBy(Journey::getStatus, Collectors.counting()));

            driverSummaryReports.add(DriverSummaryReport.builder()
                    .driverId(driver.getId())
                    .name(driver.getName())
                    .licenseNumber(driver.getLicenseNumber())
                    .email(driver.getEmail())
                    .isOccupied(driver.getIsOccupied())
                    .licenseLevel(driver.getLicenseLevel())
                    .vehicleId(vehicleId)
                    .totalJourneys(totalJourneys)
                    .totalDistance(totalDistance)
                    .avgDistancePerJourney(avgDistance)
                    .lastJourneyDate(lastJourneyDate)
                    .journeyStatusCounts(journeyStatusCounts)
                    .build());
        }
        return driverSummaryReports;
    }

    @Override
    public DriverStatusDistribution getDriverStatusDistribution() {
        long totalDrivers = driverRepository.count();
        long occupied = driverRepository.findAll().stream()
                .filter(Driver::getIsOccupied)
                .count();

        long available = totalDrivers - occupied;
        return new DriverStatusDistribution(totalDrivers, occupied, available);
    }

     @Override
    public List<DriverActivityReport> getMostActiveDrivers() {
        return driverRepository.findMostActiveDrivers(PageRequest.of(0, 5));
        // return new ArrayList<>();
    }

    @Override
    public List<DriverPerformanceReport> getTopPerformingDrivers() {
        return driverRepository.findTopPerformingDrivers(PageRequest.of(0, 5));
        // return new ArrayList<>();
    }

    @Override
    public List<InactiveDriverReport> getInactiveDrivers(int days) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
        return driverRepository.findInactiveDriversSince(threshold);
        // return new ArrayList<>();
    }
}
