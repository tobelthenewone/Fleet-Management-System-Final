package com.zemenbank.fleetmanagement.repository;

import com.zemenbank.fleetmanagement.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByVehicleId(Long vehicleId);
    // report 
    @Query("SELECT SUM(m.cost) FROM Maintenance m WHERE m.vehicle.id = :vehicleId AND m.date BETWEEN :start AND :end")
    Double sumCostByVehicleAndDateRange(@Param("vehicleId") Long vehicleId,
                                        @Param("start") LocalDate start,
                                        @Param("end") LocalDate end);

    @Query("SELECT COUNT(m) FROM Maintenance m WHERE m.vehicle.id = :vehicleId AND m.date BETWEEN :start AND :end")
    Long countByVehicleIdAndDateBetween(@Param("vehicleId") Long vehicleId,
                                    @Param("start") LocalDate start,
                                    @Param("end") LocalDate end);

    @Query("""
        SELECT m.type FROM Maintenance m 
        WHERE m.vehicle.id = :vehicleId 
        ORDER BY m.date DESC
            """)
    List<String> findLatestMaintenanceTypeByVehicleId(@Param("vehicleId") Long vehicleId);

}
