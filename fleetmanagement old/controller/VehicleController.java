package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.VehicleDTO;
import com.zemenbank.fleetmanagement.enums.VehicleCategory;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.service.VehicleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing vehicle operations in the fleet management system.
 * 
 * This controller provides endpoints for CRUD operations on vehicles including:
 * - Creating new vehicles
 * - Retrieving vehicle information
 * - Updating vehicle details
 * - Deleting vehicles
 * - Finding vehicles by insurance policy
 * 
 * All endpoints are prefixed with "/api/v1/vehicles" and follow RESTful conventions.
 */
@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor // used to generate a constructor with required arguments, i.e the final fields, and the fields that are marked with @NonNull
// this is used to inject the VehicleService bean into the controller
public class VehicleController {

    private final VehicleService vehicleService;

    /**
     * Creates a new vehicle in the fleet management system.
     * 
     * @param vehicleDTO The vehicle data transfer object containing all vehicle information
     * @return ResponseEntity<VehicleDTO> The created vehicle with generated ID and timestamps
     * 
     * This endpoint validates the input data and creates a new vehicle record.
     * If a driver ID is provided, the vehicle will be automatically assigned to that driver.
     */
    @PostMapping
    public ResponseEntity<VehicleDTO> createVehicle(@Valid @RequestBody VehicleDTO vehicleDTO) {
        VehicleDTO created = vehicleService.createVehicle(vehicleDTO);
        return ResponseEntity.ok(created);
    }

    /**
     * Retrieves a specific vehicle by its unique identifier.
     * 
     * @param id The unique identifier of the vehicle to retrieve
     * @return ResponseEntity<VehicleDTO> The vehicle data if found
     * 
     * This endpoint returns detailed vehicle information including driver assignment,
     * maintenance history, and current status. Returns 404 if vehicle not found.
     */
    @GetMapping("/logistics/{id}")
    public ResponseEntity<VehicleDTO> getVehicleById(@PathVariable Long id) {
        VehicleDTO vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    /**
     * Retrieves all vehicles in the fleet management system.
     * 
     * @return ResponseEntity<List<VehicleDTO>> List of all vehicles with their details
     * 
     * This endpoint returns a comprehensive list of all vehicles including their
     * current status, assigned drivers, and basic information. Useful for fleet overview.
     */
    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    /**
     * Updates an existing vehicle's information.
     * 
     * @param id The unique identifier of the vehicle to update
     * @param vehicleDTO The updated vehicle data
     * @return ResponseEntity<VehicleDTO> The updated vehicle information
     * 
     * This endpoint allows modification of vehicle details including driver assignment.
     * If driver assignment changes, it automatically logs the assignment history.
     */
    @PutMapping("/logistics/{id}")
    public ResponseEntity<VehicleDTO> updateVehicle(@PathVariable Long id, @RequestBody VehicleDTO vehicleDTO) {
        VehicleDTO updated = vehicleService.updateVehicle(id, vehicleDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes a vehicle from the fleet management system.
     * 
     * @param id The unique identifier of the vehicle to delete
     * @return ResponseEntity<Void> No content response on successful deletion
     * 
     * This endpoint permanently removes a vehicle from the system. If the vehicle
     * has an assigned driver, the assignment will be logged before deletion.
     */
    @DeleteMapping("/logistics/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/category/{category}")
    public ResponseEntity<List<VehicleDTO>> findVehiclesByCategory(@PathVariable VehicleCategory category) {
        List<VehicleDTO> vehicles = vehicleService.findVehiclesByCategory(category);
        return ResponseEntity.ok(vehicles);
    }
    /**
     * Finds a vehicle by its associated insurance policy ID.
     * 
     * @param insurancePolicyId The insurance policy identifier
     * @return ResponseEntity<Vehicle> The vehicle associated with the insurance policy
     * 
     * This endpoint is useful for insurance-related operations where you need to
     * find a vehicle based on its insurance policy number.
     */
    @GetMapping("/logistics/insurance-policy/{insurancePolicyId}")
    public ResponseEntity<Vehicle> getVehicleByInsurancePolicyId(@PathVariable Long insurancePolicyId) {
        Vehicle vehicle = vehicleService.getVehicleByInsurancePolicyId(insurancePolicyId);
        return ResponseEntity.ok(vehicle);
    }

}
