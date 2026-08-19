package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.DriverDTO;
import com.zemenbank.fleetmanagement.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logistics/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<DriverDTO> createDriver(@Valid @RequestBody DriverDTO driverDTO) {
        DriverDTO created = driverService.createDriver(driverDTO);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverDTO> getDriverById(@PathVariable Long id) {
        DriverDTO driver = driverService.getDriverById(id);
        return ResponseEntity.ok(driver);
    }

    @GetMapping
    public ResponseEntity<List<DriverDTO>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/available")
    public ResponseEntity<List<DriverDTO>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverDTO> updateDriver(@PathVariable Long id, @Valid @RequestBody DriverDTO driverDTO) {
        DriverDTO updated = driverService.updateDriver(id, driverDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{driverId}/assign/{vehicleId}")
    public ResponseEntity<DriverDTO> assignDriverToVehicle(
            @PathVariable Long driverId,
            @PathVariable Long vehicleId) {
        DriverDTO updated = driverService.assignDriverToVehicle(driverId, vehicleId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{driverId}/unassign")
    public ResponseEntity<DriverDTO> unassignDriverFromVehicle(@PathVariable Long driverId) {
        System.out.println("unassigning driver with id="+driverId);
        DriverDTO updated = driverService.unassignDriverFromVehicle(driverId);
        return ResponseEntity.ok(updated);
    }
} 