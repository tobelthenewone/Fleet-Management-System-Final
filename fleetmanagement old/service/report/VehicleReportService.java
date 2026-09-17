package com.zemenbank.fleetmanagement.service.report;

import java.time.LocalDateTime;
import java.util.List;

import com.zemenbank.fleetmanagement.dto.report.VehicleReportDTO;
import com.zemenbank.fleetmanagement.dto.report.VehicleStatusReportDto;
import com.zemenbank.fleetmanagement.dto.report.VehicleTypeCountDto;

public interface VehicleReportService {
    byte[] generateVehicleReportPdf(LocalDateTime startDate, LocalDateTime endDate);
    // vehicle report
    VehicleReportDTO getVehicleSummary(Long vehicleId, LocalDateTime startDate, LocalDateTime endDate);
    List<VehicleReportDTO> getVehicleSummaryForAllVehicles(LocalDateTime startDate, LocalDateTime endDate);
    // vehicle status report
    List<VehicleStatusReportDto> getVehicleStatusReport();
    List<VehicleTypeCountDto> getVehicleTypeDistribution();
}
