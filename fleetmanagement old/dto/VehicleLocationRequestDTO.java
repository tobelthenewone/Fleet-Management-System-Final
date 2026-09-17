package com.zemenbank.fleetmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VehicleLocationRequestDTO {
    private double latitude;
    private double longitude;
    private double speed;

    
}
