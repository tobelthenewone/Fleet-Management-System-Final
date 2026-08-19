package com.zemenbank.fleetmanagement.repository;

import com.zemenbank.fleetmanagement.dto.report.DriverActivityReport;
import com.zemenbank.fleetmanagement.dto.report.DriverPerformanceReport;
import com.zemenbank.fleetmanagement.dto.report.InactiveDriverReport;
import com.zemenbank.fleetmanagement.model.Driver;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for accessing driver records and reports in the database.
 * 
 * Extends JpaRepository to provide CRUD operations for Driver entities.
 * Includes custom queries for driver activity, performance, and inactivity reports.
 */
@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    /**
     * Finds a driver by their license number.
     * @param licenseNumber The driver's license number
     * @return Optional containing the driver if found
     */
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    /**
     * Finds a driver by their email address.
     * @param email The driver's email
     * @return Optional containing the driver if found
     */
    Optional<Driver> findByEmail(String email);
    /**
     * Finds a driver by the vehicle they are assigned to.
     * @param vehicleId The vehicle's unique identifier
     * @return Optional containing the driver if found
     */
    Optional<Driver> findByVehicleId(Long vehicleId);

    /**
     * Retrieves the most active drivers based on request count.
     * @param pageable Pagination information
     * @return List of driver activity reports
     */
    @Query("SELECT new com.zemenbank.fleetmanagement.dto.report.DriverActivityReport(" +
        "d.id, d.name, COUNT(r), SUM(CASE WHEN r.status = 6 THEN 1 ELSE 0 END)) " +
        "FROM Driver d " +
        "LEFT JOIN d.vehicle v " +
        "LEFT JOIN v.requests r " +
        "GROUP BY d.id, d.name " +
        "ORDER BY COUNT(r) DESC")
    List<DriverActivityReport> findMostActiveDrivers(Pageable pageable);

    /**
     * Retrieves the top performing drivers based on completed requests (status = 6).
     * @param pageable Pagination information
     * @return List of driver performance reports
     */
    @Query("SELECT new com.zemenbank.fleetmanagement.dto.report.DriverPerformanceReport(" +
            "d.id, d.name, COUNT(r)) " +
            "FROM Driver d " +
            "LEFT JOIN d.vehicle v " +
            "LEFT JOIN v.requests r " +
            "WHERE r.status = 6 " +
            "GROUP BY d.id, d.name " +
            "ORDER BY COUNT(r) DESC")
    List<DriverPerformanceReport> findTopPerformingDrivers(Pageable pageable);

    /**
     * Retrieves drivers who have been inactive since a given cutoff date.
     * @param cutoffDate The cutoff date for inactivity
     * @return List of inactive driver reports
     */
    @Query("SELECT new com.zemenbank.fleetmanagement.dto.report.InactiveDriverReport(" +
           "d.id, d.name, MAX(r.endingJourneyTime)) " +
           "FROM Driver d " +
           "LEFT JOIN d.vehicle v " +
           "LEFT JOIN v.requests r " +
           "GROUP BY d.id, d.name " +
           "HAVING MAX(r.endingJourneyTime) < :cutoffDate")
    List<InactiveDriverReport> findInactiveDriversSince(@Param("cutoffDate") LocalDateTime cutoffDate);
} 