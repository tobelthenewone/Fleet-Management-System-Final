package com.zemenbank.fleetmanagement.service.impl;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.dto.DepartmentDTO;
import com.zemenbank.fleetmanagement.dto.UserBriefDTO;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Department;
import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.repository.DepartmentRepository;
import com.zemenbank.fleetmanagement.repository.UserRepository;
import com.zemenbank.fleetmanagement.service.DepartmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Override
    public ResponseEntity<DepartmentDTO> createDepartment(DepartmentDTO departmentDTO) {
        Department department = mapToEntity(departmentDTO);
        Department savedDepartment = departmentRepository.save(department);
        return ResponseEntity.ok(mapToDTO(savedDepartment));
    }

    @Override
    public ResponseEntity<DepartmentDTO> updateDepartment(Long id, DepartmentDTO departmentDTO) {
        // DepartmentDTO existingDepartment =
        // departmentRepository.findById(id).orElseThrow(new
        // ResorceNotFoundException("Department not found"));
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found");
        }
        /**
         * fetch existing department
         */
        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        existingDepartment.setName(departmentDTO.getName());
        existingDepartment.setDescription(departmentDTO.getDescription());
        existingDepartment.setLocation(departmentDTO.getLocation());
        // Only touch manager/director if a value was actually supplied, so callers
        // can update a department without needing to already know a manager/director,
        // and can still assign them later once the relevant users exist.
        if (departmentDTO.getManagerId() != null) {
            existingDepartment.setManager(userRepository.findById(departmentDTO.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found")));
        }
        if (departmentDTO.getDirectorId() != null) {
            existingDepartment.setDirector(userRepository.findById(departmentDTO.getDirectorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Director not found")));
        }
        Department updatedDepartment = departmentRepository.save(existingDepartment);
        return ResponseEntity.ok(mapToDTO(updatedDepartment));
    }
    // @Override
    // public void deleteDepartment(Long id) {
    // if (!departmentRepository.existsById(id)) {
    // throw new ResourceNotFoundException("Department not found");
    // }
    // departmentRepository.deleteById(id);
    // ResponseEntity.noContent();
    // }

    // @Override
    // public ResponseEntity<DepartmentDTO> getDepartmentById(Long id) {
    // Department department = departmentRepository.findById(id)
    // .orElseThrow(()-> new ResourceNotFoundException( "Department not found"));

    // return ResponseEntity.ok(mapToDTO(department));
    // }

    @Override
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList());
    }

    @Override
    public ResponseEntity<DepartmentDTO> getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        return ResponseEntity.ok(mapToDTO(department));
    }

    @Override
    public ResponseEntity<Void> deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found");
        }
        departmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    DepartmentDTO mapToDTO(Department department) {
        if (department == null)
            return null;

        User manager = department.getManager();
        User director = department.getDirector();

        return DepartmentDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .manager(manager != null ? mapToUserBriefDTO(manager) : null)
                .managerId(manager != null ? manager.getId() : null)
                .director(director != null ? mapToUserBriefDTO(director) : null)
                .directorId(director != null ? director.getId() : null)
                .location(department.getLocation())
                .build();
    }

    private UserBriefDTO mapToUserBriefDTO(User user) {
        return UserBriefDTO.builder()
                .id(user.getId())
                .name(user.getName())
                // .email(user.getEmail())
                // .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .build();
    }

    Department mapToEntity(DepartmentDTO departmentDTO) {
        if (departmentDTO == null)
            return null;

        // Manager and director are optional at creation time: a brand new system
        // has no users yet, and users need a department to belong to, so we can't
        // force a manager/director to already exist here. They can be assigned
        // later via updateDepartment once users exist.
        User departmentManager = departmentDTO.getManagerId() != null
                ? userRepository.findById(departmentDTO.getManagerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Department Manager not found with id: " + departmentDTO.getManagerId()))
                : null;
        User departmentDirector = departmentDTO.getDirectorId() != null
                ? userRepository.findById(departmentDTO.getDirectorId())
                        .orElseThrow(() -> new ResourceNotFoundException("Department Director not found with id: " + departmentDTO.getDirectorId()))
                : null;

        // if (departmentManager.getRole() != Role.DEPARTMENT_HEAD) {
        //     throw new IllegalArgumentException("The given user doesn't have the required role: DEPARTMENT_MANAGER");
        // }
        
        return Department.builder()
                .id(departmentDTO.getId())
                .name(departmentDTO.getName())
                .description(departmentDTO.getDescription())
                .manager(departmentManager)
                .director(departmentDirector)
                .location(departmentDTO.getLocation())
                .build();
    }
}