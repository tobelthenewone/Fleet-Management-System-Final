package com.zemenbank.fleetmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zemenbank.fleetmanagement.model.VehicleLocation;

@Repository
public interface VehicleLocationRepository extends JpaRepository<VehicleLocation, Long> {
    VehicleLocation findTopByVehicleIdOrderByTimestampDesc(Long vehicleId);
    List<VehicleLocation> findTop10ByVehicleIdOrderByTimestampDesc(Long vehicleId);
}
