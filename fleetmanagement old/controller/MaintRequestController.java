package com.zemenbank.fleetmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zemenbank.fleetmanagement.dto.MaintRequestDTO;
import com.zemenbank.fleetmanagement.service.MaintRequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/driver/maintenance-requests")
@CrossOrigin(origins = "http://localhost:3000")
public class MaintRequestController {

    private final MaintRequestService service;


    // Create
    @PostMapping
    public ResponseEntity<MaintRequestDTO> submitRequest(@RequestBody MaintRequestDTO dto) {
        MaintRequestDTO saved = service.createRequest(dto);
        return ResponseEntity.ok(saved);
    }

    // Get all
    @GetMapping
    public ResponseEntity<List<MaintRequestDTO>> getAllRequests() {
        List<MaintRequestDTO> requests = service.getAllRequests();
        return ResponseEntity.ok(requests);
    }

    // ✅ Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<MaintRequestDTO> getById(@PathVariable Long id) {

        return ResponseEntity.ok(service. getRequestById(id));
    }
    // Update
    @PutMapping("/{id}")
    public ResponseEntity<MaintRequestDTO> updateRequest(
            @PathVariable Long id,
            @RequestBody MaintRequestDTO dto) {
        MaintRequestDTO updated = service.updateRequest(id, dto);
        return ResponseEntity.ok(updated);
    }



    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        service.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
