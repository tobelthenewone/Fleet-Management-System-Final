package com.zemenbank.fleetmanagement.service.impl;

import com.zemenbank.fleetmanagement.dto.MaintRequestDTO;
import com.zemenbank.fleetmanagement.enums.RequestStatus;
import com.zemenbank.fleetmanagement.enums.VehicleStatus;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Driver;
import com.zemenbank.fleetmanagement.model.MaintRequest;
import com.zemenbank.fleetmanagement.model.Vehicle;
// import com.zemenbank.fleetmanagement.repository.DriverRepository;
import com.zemenbank.fleetmanagement.repository.MaintRequestRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.MaintRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintRequestServiceImpl implements MaintRequestService {

    private final MaintRequestRepository maintRequestRepository;
    private final VehicleRepository vehicleRepository;
    // private final DriverRepository driverRepository;

    


    @Override
    public MaintRequestDTO createRequest(MaintRequestDTO dto) {
        MaintRequest entity = mapToEntity(dto);
        MaintRequest saved = maintRequestRepository.save(entity);
        return mapToDTO(saved);
    }


    @Override
    public List<MaintRequestDTO> getAllRequests() {
        return maintRequestRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MaintRequestDTO getRequestById(Long id) {
        MaintRequest entity = maintRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
        return mapToDTO(entity);
    }

    @Override
    public MaintRequestDTO updateRequest(Long id, MaintRequestDTO dto) {
        MaintRequest existing = maintRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));

        Vehicle vehicle = vehicleRepository.findByPlateNumber(dto.getPlateNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with plate number: " + dto.getPlateNumber()));
       Driver driver = vehicle.getDriver();
    if (driver == null) {
        throw new ResourceNotFoundException("No driver assigned to this vehicle");
    }
        existing.setVehicle(vehicle);
        existing.setDriver(driver);
        existing.setMaintenanceDetail(dto.getMaintenanceDetail());
        existing.setUrgencyLevel(dto.getUrgencyLevel());
        existing.setRequestedDate(LocalDate.parse(dto.getRequestedDate(), DateTimeFormatter.ISO_DATE));

       existing.setStatus(RequestStatus.valueOf(dto.getStatus()));

// Add logic to update the vehicle's status
if (existing.getStatus() == RequestStatus.UNDER_MAINTENANCE) {
    vehicle.setStatus(VehicleStatus.UNDER_MAINTENANCE);
} else if (existing.getStatus() == RequestStatus.COMPLETED || 
           existing.getStatus() == RequestStatus.REJECTED || 
           existing.getStatus() == RequestStatus.PENDING) {
    vehicle.setStatus(VehicleStatus.AVAILABLE);

}


// Save vehicle update
vehicleRepository.save(vehicle);




        return mapToDTO(maintRequestRepository.save(existing));
    }

    @Override
    public void deleteRequest(Long id) {
        MaintRequest existing = maintRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
        maintRequestRepository.delete(existing);
    }

    // === Mapping Methods ===

    private MaintRequestDTO mapToDTO(MaintRequest m) {
        return MaintRequestDTO.builder()
                .id(m.getId())
                .vehicleId(m.getVehicle().getId())
                .plateNumber(m.getVehicle().getPlateNumber())
                .licenseNumber(m.getDriver().getLicenseNumber())
                .driverName(m.getDriver().getName())
                .urgencyLevel(m.getUrgencyLevel())
                .maintenanceDetail(m.getMaintenanceDetail())
                .maintenanceType(m.getMaintenanceType())
                .requestedDate(m.getRequestedDate().toString())
                .status(m.getStatus().name())
                .build();
    }

   private MaintRequest mapToEntity(MaintRequestDTO dto) {
    Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + dto.getVehicleId()));

    Driver driver = vehicle.getDriver();

    if (driver == null) {
        throw new ResourceNotFoundException("No driver assigned to this vehicle");
    }

    return MaintRequest.builder()
            .vehicle(vehicle)
            .driver(driver)
            .urgencyLevel(dto.getUrgencyLevel())
            .maintenanceDetail(dto.getMaintenanceDetail())
            .maintenanceType(dto.getMaintenanceType())
            .requestedDate(LocalDate.parse(dto.getRequestedDate(), DateTimeFormatter.ISO_DATE))
            .status(RequestStatus.PENDING)
            .build();
}

}
