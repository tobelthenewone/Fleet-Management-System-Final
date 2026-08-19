package com.zemenbank.fleetmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zemenbank.fleetmanagement.model.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    // Custom query methods can be defined here if needed
}