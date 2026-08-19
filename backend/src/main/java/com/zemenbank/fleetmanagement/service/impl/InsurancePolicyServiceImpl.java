package com.zemenbank.fleetmanagement.service.impl;

import com.zemenbank.fleetmanagement.dto.InsurancePolicyDTO;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.InsurancePolicy;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.InsurancePolicyRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.InsurancePolicyService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsurancePolicyServiceImpl implements InsurancePolicyService {
    private final InsurancePolicyRepository insurancePolicyRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    public InsurancePolicyDTO createPolicy(InsurancePolicyDTO dto) {
        InsurancePolicy policy = mapToEntity(dto);
        return mapToDTO(insurancePolicyRepository.save(policy));
    }

    @Override
    public InsurancePolicyDTO getPolicyById(Long id) {
        InsurancePolicy policy = insurancePolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found with id: " + id));
        return mapToDTO(policy);
    }

    @Override
    public List<InsurancePolicyDTO> getAllPolicies() {
        return insurancePolicyRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InsurancePolicyDTO updatePolicy(Long id, InsurancePolicyDTO dto) {
        InsurancePolicy existing = insurancePolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found with id: " + id));

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + dto.getVehicleId()));

        existing.setPolicyNumber(dto.getPolicyNumber());
        existing.setProvider(dto.getProvider());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setPremiumAmount(dto.getPremiumAmount());
        existing.setCoverageType(dto.getCoverageType());
        existing.setVehicle(vehicle);

        return mapToDTO(insurancePolicyRepository.save(existing));
    }

    @Override
    @Transactional
    public void deletePolicy(Long id) {
        InsurancePolicy existing = insurancePolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found with id: " + id));

        // Break the association from the vehicle side
        Vehicle vehicle = existing.getVehicle();
        if (vehicle != null) {
            vehicle.setInsurancePolicy(null);  // Break the link
            vehicleRepository.save(vehicle);  // Persist the update
        }

        insurancePolicyRepository.delete(existing);
    }
    @Override
    public List<InsurancePolicyDTO> bulkImportPolicies(List<InsurancePolicyDTO> dtos) {
        var createdPolicies = new ArrayList<InsurancePolicyDTO>();
        for (InsurancePolicyDTO dto : dtos) {
            try {
                InsurancePolicy policy = mapToEntity(dto);
                createdPolicies.add(mapToDTO(insurancePolicyRepository.save(policy)));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return createdPolicies;
    }
    // ===== Mapping Methods =====
    private InsurancePolicyDTO mapToDTO(InsurancePolicy p) {
        return InsurancePolicyDTO.builder()
                .id(p.getId())
                .policyNumber(p.getPolicyNumber())
                .provider(p.getProvider())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .premiumAmount(p.getPremiumAmount())
                .coverageType(p.getCoverageType())
                .vehicleId(p.getVehicle() != null ? p.getVehicle().getId() : null)
                .plateNumber(p.getVehicle() != null ? p.getVehicle().getPlateNumber() : null)
                .build();
    }

    private InsurancePolicy mapToEntity(InsurancePolicyDTO dto) {
        Vehicle vehicle = vehicleRepository.findByPlateNumber(dto.getPlateNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with plate number: " + dto.getPlateNumber()));

        return InsurancePolicy.builder()
                .policyNumber(dto.getPolicyNumber())
                .provider(dto.getProvider())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .premiumAmount(dto.getPremiumAmount())
                .coverageType(dto.getCoverageType())
                .vehicle(vehicle) // set relationship
                .build();
    }








}
