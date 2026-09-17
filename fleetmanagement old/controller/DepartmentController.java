package com.zemenbank.fleetmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zemenbank.fleetmanagement.dto.DepartmentDTO;
import com.zemenbank.fleetmanagement.service.DepartmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/departments")

public class DepartmentController {

    private final DepartmentService departmentService;

    // get all departments
    @GetMapping
    public ResponseEntity<List<DepartmentDTO> >getAllDepartments() {
        return this.departmentService.getAllDepartments();
    }
    // get department by id
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDTO> getDepartmentById(@PathVariable Long id) {
        return this.departmentService.getDepartmentById(id);
    }
    // create department
    @PostMapping
    public ResponseEntity<DepartmentDTO> createDepartment(@RequestBody DepartmentDTO departmentDTO) {
        return this.departmentService.createDepartment(departmentDTO);
    }
    // update department
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDTO> updateDepartment(@PathVariable Long id, @RequestBody DepartmentDTO departmentDTO) {
        return this.departmentService.updateDepartment(id, departmentDTO);
    }
    // delete department
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        this.departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
    
}
