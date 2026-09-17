package com.zemenbank.fleetmanagement.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zemenbank.fleetmanagement.enums.JourneyStatus;
import com.zemenbank.fleetmanagement.model.Journey;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, Long> {
    // Custom query methods can be added here if needed, e.g., find by vehicle
    List<Journey> findByVehicleId(Long vehicleId);
    List<Journey> findByStatus(JourneyStatus status);
    Journey findByRequestId(Long requestId);
    List<Journey> findAllByRequestId(Long requestId);
    boolean existsByRequestIdAndStatus(Long requestId, JourneyStatus status);
    // report
   
    @Query("SELECT SUM(j.distance) FROM Journey j WHERE j.vehicle.id = :vehicleId AND j.startTime BETWEEN :start AND :end")
    Double sumDistanceByVehicleAndDateRange(@Param("vehicleId") Long vehicleId,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);
    @Query("SELECT COUNT(j) FROM Journey j WHERE j.vehicle.id = :vehicleId AND j.startTime BETWEEN :start AND :end")
    Long countByVehicleIdAndStartTimeBetween(@Param("vehicleId") Long vehicleId,
                                         @Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end);
    @Query("SELECT MAX(j.startTime) FROM Journey j WHERE j.vehicle.id = :vehicleId")
    LocalDateTime findLastAssignmentDateByVehicleId(@Param("vehicleId") Long vehicleId);


}
