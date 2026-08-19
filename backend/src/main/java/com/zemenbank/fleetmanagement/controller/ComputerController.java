package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.ComputerDTO;
import com.zemenbank.fleetmanagement.model.Computer;
import com.zemenbank.fleetmanagement.service.ComputerService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/logistics/computers")
@RequiredArgsConstructor
public class ComputerController {

    private final ComputerService computerService;

    @PostMapping
    public ResponseEntity<ComputerDTO> registerComputer(@RequestBody ComputerDTO dto) {
        return ResponseEntity.ok(computerService.register(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComputerDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(computerService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ComputerDTO>> getAll() {
        return ResponseEntity.ok(computerService.getAll());
    }

    @GetMapping("/qr/{qrCode}")
    public ResponseEntity<ComputerDTO> getByQrCode(@PathVariable String qrCode) {
        return ResponseEntity.ok(computerService.getByQrCode(qrCode));
    }

   
  @PostMapping("/generate-qr/{serialNumber}")
public ResponseEntity<ComputerDTO> generateQrCode(@PathVariable String serialNumber) {
    return ResponseEntity.ok(computerService.generateQrCode(serialNumber));
}


}
 
