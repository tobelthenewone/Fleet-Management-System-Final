package com.zemenbank.fleetmanagement.controller.report;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.zemenbank.fleetmanagement.dto.report.VehicleReportDTO;
import com.zemenbank.fleetmanagement.dto.report.VehicleStatusReportDto;
import com.zemenbank.fleetmanagement.dto.report.VehicleTypeCountDto;
import com.zemenbank.fleetmanagement.service.report.VehicleReportService;

import lombok.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final VehicleReportService vehicleReportService;

    @GetMapping("/vehicles")
    public ResponseEntity<byte[]> downloadVehicleReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime end) {

        byte[] pdfBytes = vehicleReportService.generateVehicleReportPdf(start, end);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("vehicle_report.pdf").build());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/vehicles/status-report")
    public ResponseEntity<List<VehicleStatusReportDto>> getStatusReport() {
        return ResponseEntity.ok(vehicleReportService.getVehicleStatusReport());
    }
    @GetMapping("/vehicles/summary")
    public ResponseEntity<List<VehicleReportDTO>> getVehicleSummaryForAllVehicles(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        return ResponseEntity.ok(vehicleReportService.getVehicleSummaryForAllVehicles(start, end));
    }
    @GetMapping("/vehicles/summary/{vehicleId}")
    public ResponseEntity<VehicleReportDTO> getVehicleSummary(
            @PathVariable Long vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        return ResponseEntity.ok(vehicleReportService.getVehicleSummary(vehicleId, start, end));
    }
        
    @GetMapping("/vehicles/type-distribution")
    public ResponseEntity<List<VehicleTypeCountDto>> getVehicleTypeDistribution() {
        return ResponseEntity.ok(vehicleReportService.getVehicleTypeDistribution());
    }

}
