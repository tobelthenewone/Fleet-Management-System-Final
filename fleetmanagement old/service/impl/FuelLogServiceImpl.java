package com.zemenbank.fleetmanagement.service.impl;

import com.zemenbank.fleetmanagement.dto.FuelLogDTO;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.FuelLog;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.FuelLogRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.FuelLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuelLogServiceImpl implements FuelLogService {

    private final FuelLogRepository fuelLogRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    public FuelLogDTO createFuelLog(FuelLogDTO fuelLogDTO) {
        Vehicle vehicle = vehicleRepository.findById(fuelLogDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + fuelLogDTO.getVehicleId()));
        
        FuelLog fuelLog = mapToEntity(fuelLogDTO, vehicle);
        FuelLog saved = fuelLogRepository.save(fuelLog);
        return mapToDTO(saved);
    }

    @Override
    public FuelLogDTO getFuelLogById(Long id) {
        FuelLog fuelLog = fuelLogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fuel log not found with id: " + id));
        return mapToDTO(fuelLog);
    }

    @Override
    public List<FuelLogDTO> getAllFuelLogs() {
        return fuelLogRepository.findAll()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<FuelLogDTO> getFuelLogsByVehicleId(Long vehicleId) {
        return fuelLogRepository.findByVehicleId(vehicleId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public FuelLogDTO updateFuelLog(Long id, FuelLogDTO fuelLogDTO) {
        FuelLog existingFuelLog = fuelLogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fuel log not found with id: " + id));

        Vehicle vehicle = vehicleRepository.findById(fuelLogDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + fuelLogDTO.getVehicleId()));

        existingFuelLog.setDate(fuelLogDTO.getDate());
        existingFuelLog.setLiters(fuelLogDTO.getLiters());
        existingFuelLog.setPricePerLiter(fuelLogDTO.getPricePerLiter());
        existingFuelLog.setVehicle(vehicle);

        FuelLog updated = fuelLogRepository.save(existingFuelLog);
        return mapToDTO(updated);
    }

    @Override
    public void deleteFuelLog(Long id) {
        FuelLog existingFuelLog = fuelLogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fuel log not found with id: " + id));
        fuelLogRepository.delete(existingFuelLog);
    }

    private FuelLogDTO mapToDTO(FuelLog fuelLog) {
        return FuelLogDTO.builder()
                .id(fuelLog.getId())
                .date(fuelLog.getDate())
                .liters(fuelLog.getLiters())
                .pricePerLiter(fuelLog.getPricePerLiter())
                .vehicleId(fuelLog.getVehicle().getId())
                .build();
    }

    private FuelLog mapToEntity(FuelLogDTO dto, Vehicle vehicle) {
        return FuelLog.builder()
                .id(dto.getId())
                .date(dto.getDate())
                .liters(dto.getLiters())
                .pricePerLiter(dto.getPricePerLiter())
                .vehicle(vehicle)
                .build();
    }
} 