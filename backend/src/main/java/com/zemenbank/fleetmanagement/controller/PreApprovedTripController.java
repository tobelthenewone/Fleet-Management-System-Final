package com.zemenbank.fleetmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zemenbank.fleetmanagement.dto.PreApprovedTripDTO;
import com.zemenbank.fleetmanagement.service.PreApprovedTripService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/pre-approved-trips")
@RequiredArgsConstructor
public class PreApprovedTripController {
    private final PreApprovedTripService preApprovedTripService;

    @PostMapping
    public ResponseEntity<PreApprovedTripDTO> createPreApprovedTrip(
            @RequestBody PreApprovedTripDTO preApprovedTripDto) {
        PreApprovedTripDTO createdTrip = preApprovedTripService.createPreApprovedTrip(preApprovedTripDto);
        return ResponseEntity.ok(createdTrip);
    }

    @GetMapping
    public ResponseEntity<List<PreApprovedTripDTO>> getAllPreApprovedTrips() {
        List<PreApprovedTripDTO> trips = preApprovedTripService.getAllPreApprovedTrips();
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PreApprovedTripDTO> getPreApprovedTripById(@PathVariable Long id) {
        PreApprovedTripDTO trip = preApprovedTripService.getPreApprovedTripById(id);
        return ResponseEntity.ok(trip);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PreApprovedTripDTO> updatePreApprovedTrip(
            @PathVariable Long id, @RequestBody PreApprovedTripDTO preApprovedTripDto) {
        PreApprovedTripDTO updatedTrip = preApprovedTripService.updatePreApprovedTrip(id, preApprovedTripDto);
        return ResponseEntity.ok(updatedTrip);
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<Void> deletePreApprovedTrip(@PathVariable Long id) {
        preApprovedTripService.deletePreApprovedTrip(id);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreApprovedTripById(@PathVariable Long id) {
        preApprovedTripService.deletePreApprovedTrip(id);
        return ResponseEntity.noContent().build();
    }
}
