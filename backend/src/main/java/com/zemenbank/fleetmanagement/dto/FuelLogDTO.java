package com.zemenbank.fleetmanagement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelLogDTO {

    private Long id;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Liters is required")
    @Positive(message = "Liters must be positive")
    private Double liters;

    @NotNull(message = "Price per liter is required")
    @Positive(message = "Price per liter must be positive")
    private Double pricePerLiter;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
}