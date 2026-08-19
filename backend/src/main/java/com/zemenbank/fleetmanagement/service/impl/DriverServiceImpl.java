package com.zemenbank.fleetmanagement.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zemenbank.fleetmanagement.dto.DriverDTO;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Driver;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.DriverRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.DriverService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    public DriverDTO createDriver(DriverDTO driverDTO) {
        Driver driver = mapToEntity(driverDTO);
        Driver saved = driverRepository.save(driver);
        return mapToDTO(saved);
    }

    @Override
    public DriverDTO getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
        return mapToDTO(driver);
    }

    @Override
    public List<DriverDTO> getAllDrivers() {
        return driverRepository.findAll()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public DriverDTO updateDriver(Long id, DriverDTO driverDTO) {
        Driver existingDriver = driverRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

        existingDriver.setName(driverDTO.getName());
        existingDriver.setLicenseNumber(driverDTO.getLicenseNumber());
        existingDriver.setPhoneNumber(driverDTO.getPhoneNumber());
        existingDriver.setEmail(driverDTO.getEmail());
        existingDriver.setIsOccupied(driverDTO.getIsOccupied());
        existingDriver.setLicenseLevel(driverDTO.getLicenseLevel());
        existingDriver.setImageUrl(driverDTO.getImageUrl()); // <-- Ensure imageUrl is updated on edit

        Driver updated = driverRepository.save(existingDriver);
        return mapToDTO(updated);
    }

    @Override
    public void deleteDriver(Long id) {
        Driver existingDriver = driverRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
        driverRepository.delete(existingDriver);
    }

    @Override
    @Transactional
    public DriverDTO assignDriverToVehicle(Long driverId, Long vehicleId) {
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
        
        // Check if vehicle already has a driver
        if (vehicle.getDriver() != null) {
            throw new IllegalStateException("Vehicle is already assigned to a driver");
        }
        
        // Check if driver is already assigned to a vehicle
        if (driver.getVehicle() != null) {
            throw new IllegalStateException("Driver is already assigned to a vehicle");
        }
        
        // Assign driver to vehicle
        driver.setVehicle(vehicle);
        driver.setIsOccupied(true);
        vehicle.setDriver(driver);
        
        Driver updated = driverRepository.save(driver);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public DriverDTO unassignDriverFromVehicle(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        
        if (driver.getVehicle() == null) {
            throw new IllegalStateException("Driver is not assigned to any vehicle");
        }
        
        // Unassign driver from vehicle
        Vehicle vehicle = driver.getVehicle();
        driver.setVehicle(null);
        driver.setIsOccupied(false);
        vehicle.setDriver(null);
        
        Driver updated = driverRepository.save(driver);
        return mapToDTO(updated);
    }

    @Override
    public List<DriverDTO> getAvailableDrivers() {
        return driverRepository.findAll()
            .stream()
            .filter(driver -> !driver.getIsOccupied())
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    DriverDTO mapToDTO(Driver driver) {
        return DriverDTO.builder()
                .id(driver.getId())
                .name(driver.getName())
                .licenseNumber(driver.getLicenseNumber())
                .phoneNumber(driver.getPhoneNumber())
                .email(driver.getEmail())
                .isOccupied(driver.getIsOccupied())
                .licenseLevel(driver.getLicenseLevel())
                .vehicleId(driver.getVehicle() != null ? driver.getVehicle().getId() : null)
                .imageUrl(driver.getImageUrl()) // <-- Add this line to include imageUrl in API response
                .build();
    }

    private Driver mapToEntity(DriverDTO dto) {
        if (dto == null) return null;
        Driver driver = new Driver();
        driver.setId(dto.getId());
        driver.setName(dto.getName());
        driver.setLicenseNumber(dto.getLicenseNumber());
        driver.setPhoneNumber(dto.getPhoneNumber());
        driver.setEmail(dto.getEmail());
        driver.setIsOccupied(dto.getIsOccupied());
        driver.setLicenseLevel(dto.getLicenseLevel());
        driver.setImageUrl(dto.getImageUrl()); // <-- Ensure imageUrl is mapped from DTO to entity
        return driver;
    }
}