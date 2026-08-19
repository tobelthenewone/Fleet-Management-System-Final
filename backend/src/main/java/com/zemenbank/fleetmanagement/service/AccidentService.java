package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.AccidentDTO;
import java.util.List;

/**
 * Service interface for managing accident records in the fleet management system.
 * 
 * Provides methods for creating, retrieving, updating, and deleting accident records,
 * as well as filtering accidents by vehicle.
 */
public interface AccidentService {
    /**
     * Creates a new accident record.
     * @param accidentDTO The accident data transfer object
     * @return The created accident DTO
     */
    AccidentDTO createAccident(AccidentDTO accidentDTO);
    /**
     * Retrieves an accident by its unique ID.
     * @param id The accident ID
     * @return The accident DTO
     */
    AccidentDTO getAccidentById(Long id);
    /**
     * Retrieves all accident records.
     * @return List of all accident DTOs
     */
    List<AccidentDTO> getAllAccidents();
    /**
     * Retrieves all accidents for a specific vehicle.
     * @param vehicleId The vehicle ID
     * @return List of accident DTOs for the vehicle
     */
    List<AccidentDTO> getAccidentsByVehicleId(Long vehicleId);
    /**
     * Updates an existing accident record.
     * @param id The accident ID
     * @param accidentDTO The updated accident data
     * @return The updated accident DTO
     */
    AccidentDTO updateAccident(Long id, AccidentDTO accidentDTO);
    /**
     * Updates the status of an accident record.
     * @param id The accident ID
     * @param status The new status
     * @return The updated accident DTO
     */
    AccidentDTO updateAccidentStatus(Long id, String status);
    /**
     * Deletes an accident record by its ID.
     * @param id The accident ID
     */
    void deleteAccident(Long id);
} 