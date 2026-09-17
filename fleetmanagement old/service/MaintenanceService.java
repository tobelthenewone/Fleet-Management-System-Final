package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.MaintenanceDTO;
import java.util.List;

public interface MaintenanceService {
    MaintenanceDTO createMaintenance(MaintenanceDTO maintenanceDTO);
    MaintenanceDTO getMaintenanceById(Long id);
    List<MaintenanceDTO> getAllMaintenances();
    MaintenanceDTO updateMaintenance(Long id, MaintenanceDTO maintenanceDTO);
    List<MaintenanceDTO> getMaintenancesByVehicleId(Long vehicleId);
    void deleteMaintenance(Long id);

    void bulkImportMaintenances(List<MaintenanceDTO> dtos);
}