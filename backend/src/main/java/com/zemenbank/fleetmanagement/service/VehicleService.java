package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.VehicleDTO;
import com.zemenbank.fleetmanagement.enums.VehicleCategory;
import com.zemenbank.fleetmanagement.model.Vehicle;

import java.util.List;

public interface VehicleService {

    VehicleDTO createVehicle(VehicleDTO vehicleDTO);

    VehicleDTO getVehicleById(Long id);

    List<VehicleDTO> getAllVehicles();

    VehicleDTO updateVehicle(Long id, VehicleDTO vehicleDTO);

    void deleteVehicle(Long id);

    Vehicle getVehicleByInsurancePolicyId(Long insurancePolicyId);
    // find vehicles by category
    List<VehicleDTO> findVehiclesByCategory(VehicleCategory category);
}
