package com.zemenbank.fleetmanagement.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BoloDTO {
    private Long id;
    private Double inspectionPayment;
    private Double roadFundPayment;
    private Double boloPayment;
    private LocalDate boloExpiredDate;
    private Long vehicleId;
    private String plateNumber; // For import by plate number
    private VehicleDTO vehicle;
}
