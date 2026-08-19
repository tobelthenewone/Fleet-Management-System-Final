package com.zemenbank.fleetmanagement.dto;

import com.zemenbank.fleetmanagement.enums.DepartmentLocation;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) for transferring department information between layers.
 * 
 * Contains department details and brief information about the department head.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentDTO {
    /**
     * Unique identifier for the department.
     */
    @Id
    private Long id;
    /**
     * Name of the department.
     */
    private String name;

    private DepartmentLocation location;
    /**
     * Description of the department.
     */
    private String description;
    /**
     * Brief information about the department manager (user).
     */
    private UserBriefDTO manager;
    private Long managerId;
    private UserBriefDTO director;
    private Long directorId;
}