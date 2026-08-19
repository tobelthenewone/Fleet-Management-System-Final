package com.zemenbank.fleetmanagement.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JourneyStartInput {
    private Long vehicleId;
    private Double startKilometer;
}


