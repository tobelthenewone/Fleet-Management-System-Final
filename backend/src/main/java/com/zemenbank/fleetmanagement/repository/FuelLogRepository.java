package com.zemenbank.fleetmanagement.repository;

import com.zemenbank.fleetmanagement.model.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {
    List<FuelLog> findByVehicleId(Long vehicleId);
    // report
    @Query("SELECT SUM(f.liters) FROM FuelLog f WHERE f.vehicle.id = :vehicleId AND f.date BETWEEN :start AND :end")
    Double sumLitersByVehicleAndDateRange(@Param("vehicleId") Long vehicleId,
                                          @Param("start") LocalDate start,
                                          @Param("end") LocalDate end);

    @Query("SELECT SUM(f.liters * f.pricePerLiter) FROM FuelLog f WHERE f.vehicle.id = :vehicleId AND f.date BETWEEN :start AND :end")
    Double sumCostByVehicleAndDateRange(@Param("vehicleId") Long vehicleId,
                                        @Param("start") LocalDate start,
                                        @Param("end") LocalDate end);
    @Query("SELECT COUNT(f) FROM FuelLog f WHERE f.vehicle.id = :vehicleId AND f.date BETWEEN :start AND :end")
    Long countByVehicleIdAndDateBetween(@Param("vehicleId") Long vehicleId,
                                    @Param("start") LocalDate start,
                                    @Param("end") LocalDate end);

} 