package com.zemenbank.fleetmanagement.service;



import java.util.List;

import com.zemenbank.fleetmanagement.dto.VehicleLocationRequestDTO;
import com.zemenbank.fleetmanagement.model.VehicleLocation;

public interface VehicleLocationService {
    VehicleLocation saveLocation(Long vehicleId, VehicleLocationRequestDTO request);
    VehicleLocation getLatestLocation(Long vehicleId);
    List<VehicleLocation> getAllLocations();
}

