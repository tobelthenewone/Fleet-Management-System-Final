package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.DriverAssignmentHistoryDTO;
import java.util.List;

public interface DriverAssignmentHistoryService {
    DriverAssignmentHistoryDTO createHistory(DriverAssignmentHistoryDTO historyDTO);
    List<DriverAssignmentHistoryDTO> getVehicleHistory(Long vehicleId);
    List<DriverAssignmentHistoryDTO> getDriverHistory(Long driverId);
} 