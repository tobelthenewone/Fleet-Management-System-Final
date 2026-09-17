package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.DriverAssignmentHistoryDTO;
import com.zemenbank.fleetmanagement.service.DriverAssignmentHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/driver-assignment-history")
public class DriverAssignmentHistoryController {

    @Autowired
    private DriverAssignmentHistoryService historyService;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<DriverAssignmentHistoryDTO>> getVehicleHistory(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(historyService.getVehicleHistory(vehicleId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<DriverAssignmentHistoryDTO>> getDriverHistory(@PathVariable Long driverId) {
        return ResponseEntity.ok(historyService.getDriverHistory(driverId));
    }
} 