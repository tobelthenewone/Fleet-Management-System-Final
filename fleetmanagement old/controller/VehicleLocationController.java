package com.zemenbank.fleetmanagement.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zemenbank.fleetmanagement.dto.VehicleLocationRequestDTO;
import com.zemenbank.fleetmanagement.model.VehicleLocation;
import com.zemenbank.fleetmanagement.service.VehicleLocationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
public class VehicleLocationController {

    private final VehicleLocationService locationService;

    @PostMapping("/{id}/location")
    public ResponseEntity<?> updateLocation(@PathVariable Long id, @RequestBody VehicleLocationRequestDTO request) {
        VehicleLocation saved = locationService.saveLocation(id, request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/location/latest")
    public ResponseEntity<VehicleLocation> getLatestLocation(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getLatestLocation(id));
    }

    @GetMapping("/locations")
    public ResponseEntity<List<VehicleLocation>> getAll() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }
}

