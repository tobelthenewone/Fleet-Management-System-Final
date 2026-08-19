package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.TireReplacementLogDTO;
import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.service.TireReplacementLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tire-replacement/logs")
@RequiredArgsConstructor
public class TireReplacementLogController {

    private final TireReplacementLogService service;

    // Create (Log)
    @PostMapping
    public ResponseEntity<?> logReplacement(
            @RequestBody TireReplacementLogDTO dto,
            @AuthenticationPrincipal User currentUser) {
        service.logReplacement(dto, currentUser);
        return ResponseEntity.ok().build();
    }

    // Get all logs
    @GetMapping
    public ResponseEntity<List<TireReplacementLogDTO>> getAllLogs() {
        return ResponseEntity.ok(service.getAllLogs());
    }

    // Get log by ID
    @GetMapping("/{id}")
    public ResponseEntity<TireReplacementLogDTO> getLogById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getLogById(id));
    }

    // Update log
    @PutMapping("/{id}")
    public ResponseEntity<TireReplacementLogDTO> updateLog(
            @PathVariable Long id,
            @RequestBody TireReplacementLogDTO dto) {
        return ResponseEntity.ok(service.updateLog(id, dto));
    }

    // Delete log
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        service.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}
