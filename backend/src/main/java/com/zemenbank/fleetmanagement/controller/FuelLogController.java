package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.FuelLogDTO;
import com.zemenbank.fleetmanagement.service.FuelLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logistics/fuel-logs")
@RequiredArgsConstructor
public class FuelLogController {

    private final FuelLogService fuelLogService;

    @PostMapping
    public ResponseEntity<FuelLogDTO> createFuelLog(@Valid @RequestBody FuelLogDTO fuelLogDTO) {
        FuelLogDTO created = fuelLogService.createFuelLog(fuelLogDTO);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuelLogDTO> getFuelLogById(@PathVariable Long id) {
        FuelLogDTO fuelLog = fuelLogService.getFuelLogById(id);
        return ResponseEntity.ok(fuelLog);
    }

    @GetMapping
    public ResponseEntity<List<FuelLogDTO>> getAllFuelLogs() {
        return ResponseEntity.ok(fuelLogService.getAllFuelLogs());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelLogDTO>> getFuelLogsByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(fuelLogService.getFuelLogsByVehicleId(vehicleId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuelLogDTO> updateFuelLog(@PathVariable Long id, @Valid @RequestBody FuelLogDTO fuelLogDTO) {
        FuelLogDTO updated = fuelLogService.updateFuelLog(id, fuelLogDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelLog(@PathVariable Long id) {
        fuelLogService.deleteFuelLog(id);
        return ResponseEntity.noContent().build();
    }
} 