package com.zemenbank.fleetmanagement.service;

import java.util.List;

import com.zemenbank.fleetmanagement.dto.BoloDTO;

public interface BoloService {
    BoloDTO createBolo(BoloDTO boloDTO);
    BoloDTO updateBolo(Long id, BoloDTO boloDTO);
    void deleteBolo(Long id);
    BoloDTO getBoloById(Long id);
    List<BoloDTO> getAllBolos();
    List<BoloDTO> getBolosByVehicleId(Long vehicleId);
    List<BoloDTO> bulkImportBolos(List<BoloDTO> boloDTOs);
}


