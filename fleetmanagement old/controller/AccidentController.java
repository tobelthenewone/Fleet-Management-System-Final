package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.AccidentDTO;
import com.zemenbank.fleetmanagement.service.AccidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logistics/accidents")
@RequiredArgsConstructor
public class AccidentController {

    private final AccidentService accidentService;

    @PostMapping
    public ResponseEntity<AccidentDTO> createAccident(@Valid @RequestBody AccidentDTO accidentDTO) {
        return new ResponseEntity<>(accidentService.createAccident(accidentDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccidentDTO> getAccidentById(@PathVariable Long id) {
        return ResponseEntity.ok(accidentService.getAccidentById(id));
    }

    @GetMapping
    public ResponseEntity<List<AccidentDTO>> getAllAccidents() {
        return ResponseEntity.ok(accidentService.getAllAccidents());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<AccidentDTO>> getAccidentsByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(accidentService.getAccidentsByVehicleId(vehicleId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccidentDTO> updateAccident(@PathVariable Long id, @RequestBody AccidentDTO accidentDTO) {
        return ResponseEntity.ok(accidentService.updateAccident(id, accidentDTO));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AccidentDTO> updateAccidentStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(accidentService.updateAccidentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccident(@PathVariable Long id) {
        accidentService.deleteAccident(id);
        return ResponseEntity.noContent().build();
    }
} 