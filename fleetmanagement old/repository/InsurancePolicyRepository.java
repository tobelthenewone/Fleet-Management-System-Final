package com.zemenbank.fleetmanagement.repository;

import com.zemenbank.fleetmanagement.model.InsurancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, Long> {
    List<InsurancePolicy> findByEndDateBetween(LocalDate start, LocalDate end);

    // For finding already expired policies
    List<InsurancePolicy> findByEndDateBefore(LocalDate date);
}
