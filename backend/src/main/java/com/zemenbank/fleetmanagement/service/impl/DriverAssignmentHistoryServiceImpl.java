package com.zemenbank.fleetmanagement.service.impl;

import com.zemenbank.fleetmanagement.dto.DriverAssignmentHistoryDTO;
import com.zemenbank.fleetmanagement.model.DriverAssignmentHistory;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.model.Driver;
import com.zemenbank.fleetmanagement.repository.DriverAssignmentHistoryRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.repository.DriverRepository;
import com.zemenbank.fleetmanagement.service.DriverAssignmentHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverAssignmentHistoryServiceImpl implements DriverAssignmentHistoryService {

    @Autowired
    private DriverAssignmentHistoryRepository historyRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Override
    public DriverAssignmentHistoryDTO createHistory(DriverAssignmentHistoryDTO historyDTO) {
        Vehicle vehicle = vehicleRepository.findById(historyDTO.getVehicleId())
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        Driver driver = driverRepository.findById(historyDTO.getDriverId())
            .orElseThrow(() -> new RuntimeException("Driver not found"));

        DriverAssignmentHistory history = new DriverAssignmentHistory();
        history.setVehicle(vehicle);
        history.setDriver(driver);
        history.setAssignedAt(historyDTO.getAssignedAt());
        history.setAction(historyDTO.getAction());
        history.setNotes(historyDTO.getNotes());
        
        DriverAssignmentHistory savedHistory = historyRepository.save(history);
        return convertToDTO(savedHistory);
    }

    @Override
    public List<DriverAssignmentHistoryDTO> getVehicleHistory(Long vehicleId) {
        return historyRepository.findByVehicleIdOrderByAssignedAtDesc(vehicleId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<DriverAssignmentHistoryDTO> getDriverHistory(Long driverId) {
        return historyRepository.findByDriverIdOrderByAssignedAtDesc(driverId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private DriverAssignmentHistoryDTO convertToDTO(DriverAssignmentHistory history) {
        DriverAssignmentHistoryDTO dto = new DriverAssignmentHistoryDTO();
        dto.setId(history.getId());
        dto.setVehicleId(history.getVehicle().getId());
        dto.setVehiclePlateNumber(history.getVehicle().getPlateNumber());
        dto.setDriverId(history.getDriver().getId());
        dto.setDriverName(history.getDriver().getName());
        dto.setDriverLicenseNumber(history.getDriver().getLicenseNumber());
        dto.setAssignedAt(history.getAssignedAt());
        dto.setAction(history.getAction());
        dto.setNotes(history.getNotes());
        return dto;
    }
} 