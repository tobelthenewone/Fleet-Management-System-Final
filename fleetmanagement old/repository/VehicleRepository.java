package com.zemenbank.fleetmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.zemenbank.fleetmanagement.dto.report.VehicleTypeCountDto;
import com.zemenbank.fleetmanagement.enums.VehicleCategory;
import com.zemenbank.fleetmanagement.model.Vehicle;

/**
 * Repository interface for accessing vehicle records and reports in the database.
 * 
 * Extends JpaRepository to provide CRUD operations for Vehicle entities.
 * Includes custom methods for finding vehicles by plate number, insurance policy, and for counting vehicles by type.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // Custom query methods can be defined here if needed
    // Example:  
    Optional<Vehicle> findByPlateNumber(String plateNumber);
    List<Vehicle> findAllByPreApprovedTripId(Long preApprovedTripId);
    List<Vehicle> findAllByPlateNumberIn(List<String> plateNumbers);
    List<Vehicle> findByVehicleCategory(VehicleCategory category);
    List<Vehicle> findAllByIdIn(List<Long> ids);

    // optional is used to avoid null pointer exceptions
    // you can use .isPresent() to check if the value is present
    // or .orElseThrow() to throw an exception if the value is not present
    Optional<Vehicle> findByInsurancePolicyId(Long insurancePolicyId);
    /**
     * Counts vehicles by their type and returns a summary DTO.
     * @return List of vehicle type count DTOs
     */
    @Query("SELECT new com.zemenbank.fleetmanagement.dto.report.VehicleTypeCountDto(v.type, COUNT(v)) " +
       "FROM Vehicle v GROUP BY v.type")
    List<VehicleTypeCountDto> countVehiclesByType();

}
