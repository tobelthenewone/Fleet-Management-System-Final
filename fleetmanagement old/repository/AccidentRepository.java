package com.zemenbank.fleetmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.zemenbank.fleetmanagement.model.Accident;
import java.util.List;

/**
 * Repository interface for accessing accident records in the database.
 * 
 * Extends JpaRepository to provide CRUD operations for Accident entities.
 * Includes a custom method to find accidents by vehicle ID.
 */
@Repository
public interface AccidentRepository extends JpaRepository<Accident, Long> {
    /**
     * Finds all accidents associated with a specific vehicle.
     * @param vehicleId The vehicle's unique identifier
     * @return List of accidents for the given vehicle
     */
    List<Accident> findByVehicleId(Long vehicleId);   
} 