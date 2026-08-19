package com.zemenbank.fleetmanagement.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceDTO {

    private Long id;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String description;

    @NotNull(message = "Cost is required")
    private Double cost;

    private Double contribution;

    private Double excess;

    @NotBlank(message = "Type is required")
    private String type;

    private Long vehicleId;
    private String plateNumber;
    private Long requestId;

}
