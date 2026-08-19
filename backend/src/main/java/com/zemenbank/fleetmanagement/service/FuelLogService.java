package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.FuelLogDTO;
import java.util.List;

public interface FuelLogService {
    FuelLogDTO createFuelLog(FuelLogDTO fuelLogDTO);
    FuelLogDTO getFuelLogById(Long id);
    List<FuelLogDTO> getAllFuelLogs();
    List<FuelLogDTO> getFuelLogsByVehicleId(Long vehicleId);
    FuelLogDTO updateFuelLog(Long id, FuelLogDTO fuelLogDTO);
    void deleteFuelLog(Long id);
} 