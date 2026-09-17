package com.zemenbank.fleetmanagement.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.zemenbank.fleetmanagement.dto.DepartmentDTO;

public interface DepartmentService {
    ResponseEntity<DepartmentDTO> createDepartment(DepartmentDTO departmentDTO);
    ResponseEntity<DepartmentDTO> updateDepartment(Long id, DepartmentDTO departmentDTO);
    ResponseEntity<Void> deleteDepartment(Long id);
    ResponseEntity<DepartmentDTO> getDepartmentById(Long id);
    ResponseEntity<List<DepartmentDTO>> getAllDepartments();
}   