package com.zemenbank.fleetmanagement.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.zemenbank.fleetmanagement.enums.JourneyStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JourneyDTO {

    private Long id;
    private Long vehicleId; // Use vehicleId for DTO
    private VehicleDTO vehicle; // Optional: Include full VehicleDTO if needed
    private Long driverId; // Use driverId for DTO (optional)
    private DriverDTO driver; // Optional: Include full DriverDTO if needed
    private Long requestId;
    private RequestDTO request; // Optional: Include full RequestDTO if needed
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String endLocation;
    private String purpose;
    private Double startingKilometer;
    private Double endingKilometer;
    private Double distance;
    private JourneyStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private DepartmentDTO department; // Optional: Include full DepartmentDTO if needed
    private List<UserBriefDTO> travelers;
}
