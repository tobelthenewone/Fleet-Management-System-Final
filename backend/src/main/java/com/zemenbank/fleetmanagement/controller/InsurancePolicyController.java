// ...existing code...
package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.dto.InsurancePolicyDTO;
import com.zemenbank.fleetmanagement.service.InsurancePolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/v1/logistics/insurance-policies")
@RequiredArgsConstructor
public class InsurancePolicyController {

    private final InsurancePolicyService insurancePolicyService;

    @PostMapping
    public ResponseEntity<InsurancePolicyDTO> create(@Valid @RequestBody InsurancePolicyDTO dto) {
        return ResponseEntity.ok(insurancePolicyService.createPolicy(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePolicyDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(insurancePolicyService.getPolicyById(id));
    }

    @GetMapping
    public ResponseEntity<List<InsurancePolicyDTO>> getAll() {
        return ResponseEntity.ok(insurancePolicyService.getAllPolicies());
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsurancePolicyDTO> update(@PathVariable Long id, @Valid @RequestBody InsurancePolicyDTO dto) {
        return ResponseEntity.ok(insurancePolicyService.updatePolicy(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        insurancePolicyService.deletePolicy(id);
        return ResponseEntity.ok("Insurance policy deleted successfully");
    }
    @PostMapping("/bulk-import")
    public ResponseEntity<List<InsurancePolicyDTO>> bulkImportPolicies(@RequestBody List<InsurancePolicyDTO> dtos) {
        List<InsurancePolicyDTO> createdPolicies = insurancePolicyService.bulkImportPolicies(dtos);
        return ResponseEntity.ok(createdPolicies);
    }

}
