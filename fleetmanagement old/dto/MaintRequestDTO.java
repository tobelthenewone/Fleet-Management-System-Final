package com.zemenbank.fleetmanagement.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class MaintRequestDTO {

    private Long id;
    private Long vehicleId;

    private String plateNumber;
    private String driverName;
    private String licenseNumber;
    private String maintenanceDetail;
    private String urgencyLevel;
    private String maintenanceType;
    private String requestedDate;
    private String status;

}
