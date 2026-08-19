package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.MaintenanceDTO;
import com.zemenbank.fleetmanagement.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logistics/maintenances")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping("/bulk-import")
    public ResponseEntity<?> bulkImport(@RequestBody List<MaintenanceDTO> dtos) {
        maintenanceService.bulkImportMaintenances(dtos);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<MaintenanceDTO> create(@RequestBody MaintenanceDTO dto) {
        return ResponseEntity.ok(maintenanceService.createMaintenance(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceById(id));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceDTO>> getAll() {
        return ResponseEntity.ok(maintenanceService.getAllMaintenances());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceDTO>> getMaintenancesByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(maintenanceService.getMaintenancesByVehicleId(vehicleId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceDTO> update(@PathVariable Long id, @RequestBody MaintenanceDTO dto) {
        return ResponseEntity.ok(maintenanceService.updateMaintenance(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        maintenanceService.deleteMaintenance(id);
        return ResponseEntity.noContent().build();
    }
}
