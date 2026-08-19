package com.zemenbank.fleetmanagement.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.zemenbank.fleetmanagement.dto.JourneyDTO;
import com.zemenbank.fleetmanagement.dto.report.JourneyStartInput;
import com.zemenbank.fleetmanagement.enums.JourneyStatus;
import com.zemenbank.fleetmanagement.enums.PreApprovedRequestParameter;
import com.zemenbank.fleetmanagement.service.JourneyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/logistics/journeys") 
@RequiredArgsConstructor
public class JourneyController {

    private final JourneyService journeyService;
   
    @PostMapping("/start/{requestId}")
    public ResponseEntity<List<JourneyDTO>> startJourney(
            @PathVariable Long requestId,
            @RequestBody List<JourneyStartInput> journeyInputs) {
        return ResponseEntity.ok(journeyService.startJourney(requestId, journeyInputs));
    }
    @PostMapping("/start/pre-approved")
    public ResponseEntity<List<JourneyDTO>> startPreApprovedJourney(
            @RequestBody PreApprovedRequestParameter requestParameter) {
        return ResponseEntity.ok(journeyService.startJourney(requestParameter));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<JourneyDTO> endJourney(
            @PathVariable Long id,
            @RequestBody Map<String, Double> request) {
        Double endingKilometer = request.get("endingKilometer");
        if (endingKilometer == null) {
            throw new IllegalArgumentException("endingKilometer is required");
        }
        return ResponseEntity.ok(journeyService.endJourney(id, endingKilometer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JourneyDTO> getJourneyById(@PathVariable Long id) {
        return ResponseEntity.ok(journeyService.getJourneyById(id));
    }

    @GetMapping
    public ResponseEntity<List<JourneyDTO>> getAllJourneys() {
        return ResponseEntity.ok(journeyService.getAllJourneys());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<JourneyDTO>> getJourneysByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(journeyService.getJourneysByVehicleId(vehicleId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JourneyDTO>> getJourneysByStatus(@PathVariable JourneyStatus status) {
        return ResponseEntity.ok(journeyService.getJourneysByStatus(status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JourneyDTO> updateJourney(
            @PathVariable Long id,
            @RequestBody JourneyDTO journeyDTO) {
        return ResponseEntity.ok(journeyService.updateJourney(id, journeyDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJourney(@PathVariable Long id) {
        journeyService.deleteJourney(id);
        return ResponseEntity.noContent().build();
    }
}
