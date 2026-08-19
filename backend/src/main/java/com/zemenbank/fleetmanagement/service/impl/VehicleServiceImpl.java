package com.zemenbank.fleetmanagement.service.impl;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zemenbank.fleetmanagement.dto.DriverAssignmentHistoryDTO;
import com.zemenbank.fleetmanagement.dto.VehicleDTO;
import com.zemenbank.fleetmanagement.enums.VehicleCategory;
import com.zemenbank.fleetmanagement.enums.VehicleStatus;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Driver;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.DriverRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.DriverAssignmentHistoryService;
import com.zemenbank.fleetmanagement.service.VehicleService;

import lombok.RequiredArgsConstructor;

/**
 * Service implementation for managing vehicles in the fleet management system.
 * 
 * This class provides business logic for:
 * - Creating, updating, and deleting vehicles
 * - Assigning and unassigning drivers
 * - Retrieving vehicles by various criteria
 * - Logging driver assignment history
 * - Mapping between Vehicle and VehicleDTO
 */
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final DriverAssignmentHistoryService historyService;

    /**
     * Creates a new vehicle and optionally assigns a driver.
     * Logs the assignment in the driver assignment history.
     * @param vehicleDTO The vehicle data transfer object
     * @return The created vehicle as a DTO
     */
    @Override
    @Transactional
    public VehicleDTO createVehicle(VehicleDTO vehicleDTO) {
        Vehicle vehicle = mapToEntity(vehicleDTO);
        
        // Handle driver assignment if driverId is provided
        if (vehicleDTO.getDriverId() != null) {
            Driver driver = driverRepository.findById(vehicleDTO.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + vehicleDTO.getDriverId()));
            vehicle.setDriver(driver);
        }
        
        Vehicle saved = vehicleRepository.save(vehicle);
        
        // Log driver assignment if a driver is assigned
        if (vehicleDTO.getDriverId() != null) {
            DriverAssignmentHistoryDTO historyDTO = new DriverAssignmentHistoryDTO();
            historyDTO.setVehicleId(saved.getId());
            historyDTO.setDriverId(vehicleDTO.getDriverId());
            historyDTO.setAssignedAt(LocalDateTime.now());
            historyDTO.setAction("ASSIGNED");
            historyDTO.setNotes("Initial driver assignment");
            historyService.createHistory(historyDTO);
        }
        
        return mapToDTO(saved);
    }

    /**
     * Updates an existing vehicle's information and driver assignment.
     * Logs assignment/unassignment in the driver assignment history.
     * @param id The vehicle ID
     * @param vehicleDTO The updated vehicle data
     * @return The updated vehicle as a DTO
     */
    @Override
    @Transactional
    public VehicleDTO updateVehicle(Long id, VehicleDTO vehicleDTO) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        // Log unassignment if driver is being removed
        if (existingVehicle.getDriver() != null && vehicleDTO.getDriverId() == null) {
            DriverAssignmentHistoryDTO unassignHistory = new DriverAssignmentHistoryDTO();
            unassignHistory.setVehicleId(id);
            unassignHistory.setDriverId(existingVehicle.getDriver().getId());
            unassignHistory.setAssignedAt(LocalDateTime.now());
            unassignHistory.setAction("UNASSIGNED");
            unassignHistory.setNotes("Driver unassigned during vehicle update");
            historyService.createHistory(unassignHistory);
        }
        
        // Log new assignment if driver is being changed
        if (vehicleDTO.getDriverId() != null && 
            (existingVehicle.getDriver() == null || 
             !existingVehicle.getDriver().getId().equals(vehicleDTO.getDriverId()))) {
            DriverAssignmentHistoryDTO assignHistory = new DriverAssignmentHistoryDTO();
            assignHistory.setVehicleId(id);
            assignHistory.setDriverId(vehicleDTO.getDriverId());
            assignHistory.setAssignedAt(LocalDateTime.now());
            assignHistory.setAction("ASSIGNED");
            assignHistory.setNotes("Driver assigned during vehicle update");
            historyService.createHistory(assignHistory);
        }
        
        // Update basic vehicle information
        existingVehicle.setPlateNumber(vehicleDTO.getPlateNumber());
        existingVehicle.setType(vehicleDTO.getType());
        existingVehicle.setModel(vehicleDTO.getModel());
        existingVehicle.setManufacturer(vehicleDTO.getManufacturer());
        existingVehicle.setChasseNumber(vehicleDTO.getChasseNumber());
        existingVehicle.setEngineNumber(vehicleDTO.getEngineNumber());
        existingVehicle.setYearOfMade(vehicleDTO.getYearOfMade());
        existingVehicle.setEnginCC(vehicleDTO.getEnginCC());
        existingVehicle.setAssignedAt(vehicleDTO.getAssignedAt());
        existingVehicle.setSeatCapa(vehicleDTO.getSeatCapa());
        existingVehicle.setMinLicenseLevel(vehicleDTO.getMinLicenseLevel());
        existingVehicle.setPurchasedDate(vehicleDTO.getPurchasedDate());
        existingVehicle.setVehicleAmount(vehicleDTO.getVehicleAmount());
        existingVehicle.setInspection(vehicleDTO.getInspection());
        existingVehicle.setInsuranceDate(vehicleDTO.getInsuranceDate());
        existingVehicle.setPincode(vehicleDTO.getPincode());
        existingVehicle.setCardNumber(vehicleDTO.getCardNumber());
        existingVehicle.setStatus(vehicleDTO.getStatus());
        existingVehicle.setImageUrl(vehicleDTO.getImageUrl()); // <-- Ensure imageUrl is updated on edit

        // Update new fields
        existingVehicle.setMileage(vehicleDTO.getMileage());
        existingVehicle.setKilometersSinceLastService(vehicleDTO.getKilometersSinceLastService());
        existingVehicle.setRecentBreakdown(vehicleDTO.getRecentBreakdown());

        // Handle driver assignment
        if (vehicleDTO.getDriverId() != null) {
            Driver driver = driverRepository.findById(vehicleDTO.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + vehicleDTO.getDriverId()));
            existingVehicle.setDriver(driver);
        } else {
            existingVehicle.setDriver(null);
        }

        Vehicle updated = vehicleRepository.save(existingVehicle);
        return mapToDTO(updated);
    }

    /**
     * Retrieves a vehicle by its unique ID.
     * @param id The vehicle ID
     * @return The vehicle as a DTO
     */
    @Override
    public VehicleDTO getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return mapToDTO(vehicle);
    }

    /**
     * Retrieves all vehicles in the system.
     * @return List of all vehicles as DTOs
     */
    @Override
    public List<VehicleDTO> getAllVehicles() {

        List<Vehicle> vehicles = vehicleRepository.findAll();
        if (vehicles.isEmpty()) {
            throw new ResourceNotFoundException("No vehicles found in the system.");
        }
        // instread of stream use for loop to change it to dto using mapToDTO

        List<VehicleDTO> vehiclesDto = new ArrayList<>();

        for (Vehicle vehicle : vehicles) {
            vehiclesDto.add(mapToDTO(vehicle));
        }
        return vehiclesDto;        
    }


    /**
     * Retrieves a vehicle by its insurance policy ID.
     * @param insurancePolicyId The insurance policy ID
     * @return The vehicle entity
     */
    @Override
    public Vehicle getVehicleByInsurancePolicyId(Long insurancePolicyId) {
        return vehicleRepository.findByInsurancePolicyId(insurancePolicyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with insurance policy ID: " + insurancePolicyId));
    }

    /**
     * Deletes a vehicle and logs driver unassignment if applicable.
     * @param id The vehicle ID
     */
    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
            
        // Log unassignment if vehicle has a driver
        if (vehicle.getDriver() != null) {
            DriverAssignmentHistoryDTO historyDTO = new DriverAssignmentHistoryDTO();
            historyDTO.setVehicleId(id);
            historyDTO.setDriverId(vehicle.getDriver().getId());
            historyDTO.setAssignedAt(LocalDateTime.now());
            historyDTO.setAction("UNASSIGNED");
            historyDTO.setNotes("Driver unassigned due to vehicle deletion");
            historyService.createHistory(historyDTO);
        }
        
        vehicleRepository.delete(vehicle);
    }

    /**
     * Maps a Vehicle entity to a VehicleDTO, including maintenance status.
     * @param vehicle The vehicle entity
     * @return The vehicle DTO
     */
    VehicleDTO mapToDTO(Vehicle vehicle) {
        // Calculate maintenanceLastMonth based on maintenance logs
        boolean maintenanceLastMonth = false;
        if (vehicle.getMaintenancesRecords() != null) {
            LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
            maintenanceLastMonth = vehicle.getMaintenancesRecords().stream()
                .anyMatch(maintenance -> maintenance.getDate().isAfter(thirtyDaysAgo));
        }
        /**
         * if vehicle category is DEPARTMENT_SCHEDULED then set the status to occupied if current time is between 5 PM and 7 AM
         * else set the status to available
         * if the vehicle category is DEPARTMENT_EXCLUSIVE or EXECUTIVE_ONLY then set the status to occupied
         * 
         */
        // LocalTime now = LocalTime.now();
        // if (vehicle.getVehicleCategory() == VehicleCategory.DEPARTMENT_SCHEDULED) {
        //     if (now.isAfter(LocalTime.of(17, 0)) || now.isBefore(LocalTime.of(7, 0))) {
        //         vehicle.setStatus(VehicleStatus.OCCUPIED);
        //     } else {
        //         vehicle.setStatus(VehicleStatus.AVAILABLE);
        //     }
        // } else if (vehicle.getVehicleCategory() == VehicleCategory.DEPARTMENT_EXCLUSIVE || vehicle.getVehicleCategory() == VehicleCategory.EXECUTIVE_ONLY) {
        //     vehicle.setStatus(VehicleStatus.OCCUPIED);
        // }

        return VehicleDTO.builder()
                .id(vehicle.getId())
                .plateNumber(vehicle.getPlateNumber())
                .type(vehicle.getType())
                .model(vehicle.getModel())
                .manufacturer(vehicle.getManufacturer())
                .chasseNumber(vehicle.getChasseNumber())
                .assignedAt(vehicle.getAssignedAt())
                .cardNumber(vehicle.getCardNumber())
                .enginCC(vehicle.getEnginCC())
                .yearOfMade(vehicle.getYearOfMade())
                .seatCapa(vehicle.getSeatCapa())
                .minLicenseLevel(vehicle.getMinLicenseLevel())
                .inspection(vehicle.getInspection())
                .insuranceDate(vehicle.getInsuranceDate())
                .engineNumber(vehicle.getEngineNumber())
                .pincode(vehicle.getPincode())
                .purchasedDate(vehicle.getPurchasedDate())
                .vehicleAmount(vehicle.getVehicleAmount())
                .driverId(vehicle.getDriver() != null ? vehicle.getDriver().getId() : null)
                .driverName(vehicle.getDriver() != null ? vehicle.getDriver().getName() : null)
                .driverPhoneNumber(vehicle.getDriver() != null ? vehicle.getDriver().getPhoneNumber() : null)
                .status(vehicle.getStatus())
                .imageUrl(vehicle.getImageUrl()) // Ensure imageUrl is included in DTO
                .mileage(vehicle.getMileage())
                .kilometersSinceLastService(vehicle.getKilometersSinceLastService())
                .recentBreakdown(vehicle.getRecentBreakdown())
                .maintenanceLastMonth(maintenanceLastMonth)
                .vehicleCategory(vehicle.getVehicleCategory())
                .build();
    }

    /**
     * Maps a VehicleDTO to a Vehicle entity.
     * @param dto The vehicle DTO
     * @return The vehicle entity
     */
    private Vehicle mapToEntity(VehicleDTO dto) {
        return Vehicle.builder()
                .id(dto.getId())
                .plateNumber(dto.getPlateNumber())
                .type(dto.getType())
                .model(dto.getModel())
                .manufacturer(dto.getManufacturer())
                .chasseNumber(dto.getChasseNumber())
                .assignedAt(dto.getAssignedAt())
                .cardNumber(dto.getCardNumber())
                .enginCC(dto.getEnginCC())
                .yearOfMade(dto.getYearOfMade())
                .seatCapa(dto.getSeatCapa())
                .minLicenseLevel(dto.getMinLicenseLevel())
                .inspection(dto.getInspection())
                .insuranceDate(dto.getInsuranceDate())
                .engineNumber(dto.getEngineNumber())
                .pincode(dto.getPincode())
                .purchasedDate(dto.getPurchasedDate())
                .vehicleAmount(dto.getVehicleAmount())
                .status(dto.getStatus() != null ? dto.getStatus() : VehicleStatus.AVAILABLE)
                .imageUrl(dto.getImageUrl()) // Ensure imageUrl is mapped from DTO to entity
                .mileage(dto.getMileage())
                .kilometersSinceLastService(dto.getKilometersSinceLastService())
                .recentBreakdown(dto.getRecentBreakdown())
                .vehicleCategory(null != dto.getVehicleCategory() ? dto.getVehicleCategory() : VehicleCategory.GENERAL)
                .build();
    }

    @Override
    public List<VehicleDTO> findVehiclesByCategory(VehicleCategory category) {
        System.out.println("Finding vehicles by category: " + category);
        List<Vehicle> vehicles = vehicleRepository.findByVehicleCategory(category);
        if (vehicles.isEmpty()) {
            return new ArrayList<>(); // Return empty list if no vehicles found
        }
        
        List<VehicleDTO> vehicleDTOs = new ArrayList<>();
        for (Vehicle vehicle : vehicles) {
            vehicleDTOs.add(mapToDTO(vehicle));
        }
        return vehicleDTOs;
    } 
}

