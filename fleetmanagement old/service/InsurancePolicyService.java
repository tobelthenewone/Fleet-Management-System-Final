package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.InsurancePolicyDTO;

import java.util.List;

public interface InsurancePolicyService {
    InsurancePolicyDTO createPolicy(InsurancePolicyDTO dto);
    InsurancePolicyDTO getPolicyById(Long id);
    List<InsurancePolicyDTO> getAllPolicies();
    InsurancePolicyDTO updatePolicy(Long id, InsurancePolicyDTO dto);
    void deletePolicy(Long id);
    List<InsurancePolicyDTO> bulkImportPolicies(List<InsurancePolicyDTO> dtos);
}
