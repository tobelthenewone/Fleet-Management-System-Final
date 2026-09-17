// TireReplacementController.java
package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.MaintRequestDTO;
import com.zemenbank.fleetmanagement.dto.TireReplacementLogDTO;
import com.zemenbank.fleetmanagement.dto.TireReplacementRequestDTO;
import com.zemenbank.fleetmanagement.enums.RequestStatus;
import com.zemenbank.fleetmanagement.model.TireReplacementRequest;
import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.service.TireReplacementRequestService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tire-replacement")
@RequiredArgsConstructor
public class TireReplacementRequestController {

    private final TireReplacementRequestService service;

    @PostMapping("/request")
    public ResponseEntity<TireReplacementRequestDTO> createRequest(
            @RequestBody TireReplacementRequestDTO dto) {
        return ResponseEntity.ok(service.createRequest(dto));
    }

    @PutMapping("/{requestId}/verify")
    public ResponseEntity<Void> verifyRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User currentUser) {
        service.verifyRequest(requestId, currentUser);
        return ResponseEntity.ok().build();
    }

    // TireReplacementRequestController.java
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        service.rejectRequest(id, currentUser);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{requestId}/approve")
    public ResponseEntity<Void> approveRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User currentUser) {
        service.approveRequest(requestId, currentUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TireReplacementRequestDTO> getById(@PathVariable Long id) {

        return ResponseEntity.ok(service.getRequestById(id));
    }

    @GetMapping
    public ResponseEntity<List<TireReplacementRequestDTO>> getAllRequests() {
        List<TireReplacementRequestDTO> requests = service.getAllRequests();
        return ResponseEntity.ok(requests);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<TireReplacementRequestDTO> updateRequest(
            @PathVariable Long id,
            @RequestBody TireReplacementRequestDTO dto) {
        TireReplacementRequestDTO updated = service.updateRequest(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        service.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
    // Existing Get, Put, Delete endpoints...
}
