package com.zemenbank.fleetmanagement.repository;

import com.zemenbank.fleetmanagement.model.DriverAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DriverAssignmentHistoryRepository extends JpaRepository<DriverAssignmentHistory, Long> {
    List<DriverAssignmentHistory> findByVehicleIdOrderByAssignedAtDesc(Long vehicleId);
    List<DriverAssignmentHistory> findByDriverIdOrderByAssignedAtDesc(Long driverId);
} 