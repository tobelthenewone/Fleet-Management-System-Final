package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.DriverDTO;
import java.util.List;

public interface DriverService {
    DriverDTO createDriver(DriverDTO driverDTO);
    DriverDTO getDriverById(Long id);
    List<DriverDTO> getAllDrivers();
    DriverDTO updateDriver(Long id, DriverDTO driverDTO);
    void deleteDriver(Long id);
    DriverDTO assignDriverToVehicle(Long driverId, Long vehicleId);
    DriverDTO unassignDriverFromVehicle(Long driverId);
    List<DriverDTO> getAvailableDrivers();
} 