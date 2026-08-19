package com.zemenbank.fleetmanagement.service.impl.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.dto.VehicleDTO;
import com.zemenbank.fleetmanagement.dto.report.VehicleReportDTO;
import com.zemenbank.fleetmanagement.dto.report.VehicleStatusReportDto;
import com.zemenbank.fleetmanagement.dto.report.VehicleTypeCountDto;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.*;
import com.zemenbank.fleetmanagement.service.VehicleService;
import com.zemenbank.fleetmanagement.service.report.VehicleReportService;
import com.zemenbank.fleetmanagement.utils.PdfGenerator;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleReportServiceImpl implements VehicleReportService {

    private final VehicleRepository vehicleRepository;
    private final JourneyRepository journeyRepository;
    private final FuelLogRepository fuelLogRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final PdfGenerator pdfGenerator; // We'll implement this next
    private final VehicleService vehicleService;
    private final AccidentRepository accidentRepository;

    @Override
    public byte[] generateVehicleReportPdf(LocalDateTime startDate, LocalDateTime endDate) {
        List<Vehicle> vehicles = vehicleRepository.findAll();

        List<VehicleReportDTO> reportData = vehicles.stream().map(vehicle -> {
            Long vehicleId = vehicle.getId();

            Double totalDistance = journeyRepository.sumDistanceByVehicleAndDateRange(vehicleId, startDate, endDate);
            Double totalFuel = fuelLogRepository.sumLitersByVehicleAndDateRange(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());
            Double totalFuelCost = fuelLogRepository.sumCostByVehicleAndDateRange(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());
            Double totalMaintenanceCost = maintenanceRepository.sumCostByVehicleAndDateRange(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());

            return VehicleReportDTO.builder()
                    .vehicleId(vehicleId)
                    .plateNumber(vehicle.getPlateNumber())
                    .model(vehicle.getModel())
                    .manufacturer(vehicle.getManufacturer())
                    .yearOfMade(vehicle.getYearOfMade())
                    .totalDistance(totalDistance != null ? totalDistance : 0)
                    .totalFuelConsumed(totalFuel != null ? totalFuel : 0)
                    .totalFuelCost(totalFuelCost != null ? totalFuelCost : 0)
                    .totalMaintenanceCost(totalMaintenanceCost != null ? totalMaintenanceCost : 0)
                    .reportStartDate(startDate)
                    .reportEndDate(endDate)
                    .build();
        }).toList();

        return pdfGenerator.generateVehicleReport(reportData);
    }

    @Override
    public VehicleReportDTO getVehicleSummary(Long vehicleId, LocalDateTime startDate, LocalDateTime endDate) {
        VehicleDTO vehicle = vehicleService.getVehicleById(vehicleId);

        Double distance = journeyRepository.sumDistanceByVehicleAndDateRange(vehicleId, startDate, endDate);
        Double liters = fuelLogRepository.sumLitersByVehicleAndDateRange(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());
        Double fuelCost = fuelLogRepository.sumCostByVehicleAndDateRange(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());
        Double maintenanceCost = maintenanceRepository.sumCostByVehicleAndDateRange(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());

        Long journeyCount = journeyRepository.countByVehicleIdAndStartTimeBetween(vehicleId, startDate, endDate);
        Long maintenanceCount = maintenanceRepository.countByVehicleIdAndDateBetween(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());
        Long fuelLogCount = fuelLogRepository.countByVehicleIdAndDateBetween(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());
        return VehicleReportDTO.builder()
                .vehicleId(vehicleId)
                .plateNumber(vehicle.getPlateNumber())
                .model(vehicle.getModel())
                .manufacturer(vehicle.getManufacturer())
                .yearOfMade(vehicle.getYearOfMade())
                .reportStartDate(startDate)
                .reportEndDate(endDate)
                .totalDistance(distance != null ? distance : 0.0)
                .totalFuelConsumed(liters != null ? liters : 0.0)
                .totalFuelCost(fuelCost != null ? fuelCost : 0.0)
                .totalMaintenanceCost(maintenanceCost != null ? maintenanceCost : 0.0)
                .totalJourneys(journeyCount)
                .totalMaintenances(maintenanceCount)
                .totalFuelLogs(fuelLogCount)
                .build();
        }

    @Override
    public List<VehicleStatusReportDto> getVehicleStatusReport() { 
        List<Vehicle> vehicles = vehicleRepository.findAll();
        if (vehicles.isEmpty()) {
            return List.of(); // Return an empty list if no vehicles are found
        }
        List<VehicleStatusReportDto> vehicleStatusReportDtos = new ArrayList<>();
        for(Vehicle vehicle : vehicles) {
            LocalDateTime lastAssignment = journeyRepository.findLastAssignmentDateByVehicleId(vehicle.getId());

            Long daysSince = (lastAssignment != null)
                ? ChronoUnit.DAYS.between(lastAssignment, LocalDateTime.now())
                : null;

            List<String> maintenanceTypes = maintenanceRepository.findLatestMaintenanceTypeByVehicleId(vehicle.getId());
            String maintenanceStatus = maintenanceTypes.isEmpty() ? "Good Condition" : maintenanceTypes.get(0); // or "No Maintenance"

            VehicleStatusReportDto statusReportDto = new VehicleStatusReportDto(
                vehicle.getPlateNumber(),
                vehicle.getModel(), // or vehicle.getType() if you have that field
                lastAssignment,
                daysSince,
                maintenanceStatus
            );

            vehicleStatusReportDtos.add(statusReportDto);
        }
        return vehicleStatusReportDtos;
    }

    @Override
    public List<VehicleReportDTO> getVehicleSummaryForAllVehicles(LocalDateTime startDate, LocalDateTime endDate) {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<VehicleReportDTO> vehicleReportDTOs = new ArrayList<>();

        for(Vehicle vehicle : vehicles) {
            Long vehicleId = vehicle.getId();
            // if startDate is null or undefined fetch all data of this year
        if (startDate == null || endDate == null) {
            LocalDateTime now = LocalDateTime.now();
            startDate = LocalDateTime.of(now.getYear(), 1, 1, 0, 0, 0);
            endDate = LocalDateTime.of(now.getYear(), 12, 31, 23, 59, 59);
        }

            Double totalDistance = journeyRepository.sumDistanceByVehicleAndDateRange(vehicleId, startDate, endDate);
            Double totalFuel = fuelLogRepository.sumLitersByVehicleAndDateRange(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());
            Double totalFuelCost = fuelLogRepository.sumCostByVehicleAndDateRange(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());
            Double totalMaintenanceCost = maintenanceRepository.sumCostByVehicleAndDateRange(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());
            Long totalJounies= journeyRepository.countByVehicleIdAndStartTimeBetween(vehicleId, startDate, endDate);
            int totalAccidents=accidentRepository.findByVehicleId(vehicleId).size();
            Long maintenanceCount = maintenanceRepository.countByVehicleIdAndDateBetween(vehicleId, startDate.toLocalDate(), endDate.toLocalDate());

            VehicleReportDTO reportDTO = VehicleReportDTO.builder()
                    .vehicleId(vehicleId)
                    .plateNumber(vehicle.getPlateNumber())
                    .model(vehicle.getModel())
                    .manufacturer(vehicle.getManufacturer())
                    .yearOfMade(vehicle.getYearOfMade())
                    .totalDistance(totalDistance != null ? totalDistance : 0)
                    .totalJourneys(totalJounies!=null? totalJounies:0)
                    .totalFuelConsumed(totalFuel != null ? totalFuel : 0)
                    .totalFuelCost(totalFuelCost != null ? totalFuelCost : 0)
                    .totalMaintenanceCost(totalMaintenanceCost != null ? totalMaintenanceCost : 0)
                    .totalAccidents(totalAccidents)
                    .reportStartDate(startDate)
                    .reportEndDate(endDate)
                    .totalMaintenances(maintenanceCount != null ? maintenanceCount : 0L)
                    .build();

            vehicleReportDTOs.add(reportDTO);
        }
        return vehicleReportDTOs;

    }

    @Override
    public List<VehicleTypeCountDto> getVehicleTypeDistribution() {
        return vehicleRepository.countVehiclesByType();
    }
}

