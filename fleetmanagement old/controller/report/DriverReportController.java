package com.zemenbank.fleetmanagement.controller.report;


import com.zemenbank.fleetmanagement.dto.report.DriverSummaryReport;
import com.zemenbank.fleetmanagement.dto.report.InactiveDriverReport;
import com.zemenbank.fleetmanagement.dto.report.DriverActivityReport;
import com.zemenbank.fleetmanagement.dto.report.DriverPerformanceReport;
import com.zemenbank.fleetmanagement.dto.report.DriverStatusDistribution;
import com.zemenbank.fleetmanagement.service.report.DriverReportService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports/drivers")
@RequiredArgsConstructor
public class DriverReportController {

    private final DriverReportService driverReportService;

    @GetMapping("/summary")
    public List<DriverSummaryReport> getDriverSummaries() {
        return driverReportService.getDriverSummaries();
    }
    @GetMapping("/status-distribution")
    public DriverStatusDistribution getDriverStatusDistribution() {
        return driverReportService.getDriverStatusDistribution();
    }
     @GetMapping("/most-active")
    public List<DriverActivityReport> getMostActiveDrivers() {
        return driverReportService.getMostActiveDrivers();
    }

    @GetMapping("/top-performance")
    public List<DriverPerformanceReport> getTopPerformingDrivers() {
        return driverReportService.getTopPerformingDrivers();
    }

   @GetMapping("/inactive")
    public List<InactiveDriverReport> getInactiveDrivers(@RequestParam(defaultValue = "30") int days) {
        return driverReportService.getInactiveDrivers(days);
    }

   
}