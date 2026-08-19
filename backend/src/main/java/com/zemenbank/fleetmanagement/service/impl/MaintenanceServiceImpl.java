package com.zemenbank.fleetmanagement.service.impl;

import com.zemenbank.fleetmanagement.dto.MaintenanceDTO;
import com.zemenbank.fleetmanagement.model.MaintRequest;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Maintenance;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.MaintRequestRepository;
import com.zemenbank.fleetmanagement.repository.MaintenanceRepository;


import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final MaintRequestRepository maintRequestRepository;

    @Override
    public MaintenanceDTO createMaintenance(MaintenanceDTO dto) {
        Maintenance maintenance = mapToEntity(dto);
        return mapToDTO(maintenanceRepository.save(maintenance));

    }

    @Override
    public MaintenanceDTO getMaintenanceById(Long id) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found with id: " + id));
        return mapToDTO(maintenance);
    }

    @Override
    public List<MaintenanceDTO> getAllMaintenances() {
        List<Maintenance> maintenances = maintenanceRepository.findAll();
        return maintenances.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    @Override
    public MaintenanceDTO updateMaintenance(Long id, MaintenanceDTO dto) {
        Maintenance existing = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found with id: " + id));

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + dto.getVehicleId()));

        existing.setDate(dto.getDate());
        existing.setDescription(dto.getDescription());
        existing.setCost(dto.getCost());
        existing.setType(dto.getType());
        existing.setVehicle(vehicle);
        existing.setContribution(dto.getContribution());
        existing.setExcess(dto.getExcess());

        return mapToDTO(maintenanceRepository.save(existing));
    }

    @Override
    public void deleteMaintenance(Long id) {
        Maintenance existing = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found with id: " + id));
        maintenanceRepository.delete(existing);
    }
    @Override
    public List<MaintenanceDTO> getMaintenancesByVehicleId(Long vehicleId) {
        List<Maintenance> maintenances = maintenanceRepository.findByVehicleId(vehicleId);
        return maintenances.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    // === Mapping Methods ===

    private MaintenanceDTO mapToDTO(Maintenance m) {
        return MaintenanceDTO.builder()
                .id(m.getId())
                .date(m.getDate())
                .description(m.getDescription())
                .cost(m.getCost())
                .contribution(m.getContribution())
                .excess(m.getExcess())
                .type(m.getType())
                .vehicleId(m.getVehicle() != null ? m.getVehicle().getId() : null)
                .plateNumber(m.getVehicle() != null ? m.getVehicle().getPlateNumber() : null)
                .requestId(
                    m.getRequest() != null ? m.getRequest().getId() : null
                )
                .build();
    }

    private Maintenance mapToEntity(MaintenanceDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + dto.getVehicleId()));
         MaintRequest request = null;
        if (dto.getRequestId() != null) {
            request = maintRequestRepository.findById(dto.getRequestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + dto.getRequestId()));
        }        

        return Maintenance.builder()
                .id(dto.getId())
                .date(dto.getDate())
                .description(dto.getDescription())
                .cost(dto.getCost())
                .contribution(dto.getContribution())
                .excess(dto.getExcess())
                .type(dto.getType())
                .vehicle(vehicle)
                .request(request)
                .build();
    }

    @Override
    public void bulkImportMaintenances(List<MaintenanceDTO> dtos) {
        for (MaintenanceDTO dto : dtos) {
            try {
                // If vehicleId is missing, try to resolve by plateNumber
                if (dto.getVehicleId() == null && dto.getPlateNumber() != null) {
                    Vehicle vehicle = vehicleRepository.findByPlateNumber(dto.getPlateNumber())
                        .orElse(null);
                    if (vehicle != null) {
                        dto.setVehicleId(vehicle.getId());
                    }
                }
                // Validate required fields
                if ((dto.getVehicleId() == null && (dto.getPlateNumber() == null || dto.getPlateNumber().isEmpty()))
                    || dto.getDate() == null || dto.getCost() == null || dto.getType() == null) {
                    continue; // skip invalid row
                }
                Maintenance maintenance = mapToEntity(dto);
                maintenanceRepository.save(maintenance);
            } catch (Exception e) {
                // Optionally log error and skip row
                // e.printStackTrace();
            }
        }
    }
}
