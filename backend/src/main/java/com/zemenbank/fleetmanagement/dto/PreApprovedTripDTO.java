package com.zemenbank.fleetmanagement.dto;

import java.util.List;

import com.zemenbank.fleetmanagement.enums.AssignmentType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PreApprovedTripDTO {
    private Long id;
    private Long departmentId; // Use departmentId for DTO
    private DepartmentDTO department; // Optional: Include full DepartmentDTO if needed
    private List<Long> vehicleIds; // Use List<Long> for vehicle IDs in DTO
    private List<VehicleDTO> vehicles; // Optional: Include full VehicleDTOs if needed
    private AssignmentType assignmentType; // Use AssignmentType enum for assignment type

}
