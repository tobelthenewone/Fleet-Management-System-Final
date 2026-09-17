package com.zemenbank.fleetmanagement.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zemenbank.fleetmanagement.dto.BoloDTO;
import com.zemenbank.fleetmanagement.service.BoloService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/logistics/bolos")
@RequiredArgsConstructor
public class BoloController {
    private final BoloService boloService;

    @PostMapping
    public ResponseEntity<BoloDTO> createBolo(@RequestBody BoloDTO boloDTO) {
        BoloDTO createdBolo = boloService.createBolo(boloDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBolo);
    }
    @GetMapping
    public ResponseEntity<List<BoloDTO>> getAllBolos() {
        List<BoloDTO> bolos = boloService.getAllBolos();
        return ResponseEntity.ok(bolos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoloDTO> getBoloById(@PathVariable Long id) {
        BoloDTO bolo = boloService.getBoloById(id);
        return ResponseEntity.ok(bolo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoloDTO> updateBolo(@PathVariable Long id, @RequestBody BoloDTO boloDTO) {
        BoloDTO updatedBolo = boloService.updateBolo(id, boloDTO);
        return ResponseEntity.ok(updatedBolo);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBolo(@PathVariable Long id) {
        boloService.deleteBolo(id);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/bulk-import")
    public ResponseEntity<List<BoloDTO>> bulkImportBolos(@RequestBody List<BoloDTO> boloDTOs) {
        List<BoloDTO> createdBolos = boloService.bulkImportBolos(boloDTOs);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBolos);
    }

}
