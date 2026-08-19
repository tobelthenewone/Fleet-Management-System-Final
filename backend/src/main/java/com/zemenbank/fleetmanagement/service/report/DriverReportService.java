package com.zemenbank.fleetmanagement.service.report;

import java.util.List;

import com.zemenbank.fleetmanagement.dto.report.DriverActivityReport;
import com.zemenbank.fleetmanagement.dto.report.DriverPerformanceReport;
import com.zemenbank.fleetmanagement.dto.report.DriverStatusDistribution;
import com.zemenbank.fleetmanagement.dto.report.DriverSummaryReport;
import com.zemenbank.fleetmanagement.dto.report.InactiveDriverReport;

public interface DriverReportService {
    List<DriverSummaryReport> getDriverSummaries();
    DriverStatusDistribution getDriverStatusDistribution();
    List<DriverActivityReport> getMostActiveDrivers();
    List<DriverPerformanceReport> getTopPerformingDrivers();
    List<InactiveDriverReport> getInactiveDrivers(int days);

}