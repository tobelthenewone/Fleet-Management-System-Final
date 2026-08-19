package com.zemenbank.fleetmanagement.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.dto.BoloDTO;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Bolo;
import com.zemenbank.fleetmanagement.repository.BoloRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.BoloService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoloServiceImpl implements BoloService {

    // Inject the BoloRepository
    private final BoloRepository boloRepository;
    private final VehicleServiceImpl vehicleService;
    private final VehicleRepository vehicleRepository;


    @Override
    public List<BoloDTO> getAllBolos() {
        List<Bolo> boloEntities = boloRepository.findAll();
        if (boloEntities.isEmpty()) {
            return new ArrayList<>(); 
        }
        var boloDTOs = new ArrayList<BoloDTO>();
        for (Bolo bolo : boloEntities) {
            boloDTOs.add(mapToDTO(bolo));
        }
        return boloDTOs;
    }

    @Override
    public List<BoloDTO> getBolosByVehicleId(Long vehicleId) {
        List<Bolo> boloEntities = boloRepository.findByVehicleId(vehicleId);
        if (boloEntities.isEmpty()) {
            return new ArrayList<>();
        }
        var boloDTOs = new ArrayList<BoloDTO>();
        for (Bolo bolo : boloEntities) {
            boloDTOs.add(mapToDTO(bolo));
        }
        return boloDTOs;
    }

    @Override
    public BoloDTO createBolo(BoloDTO boloDTO) {
        Bolo boloEntity = mapToEntity(boloDTO);
        Bolo savedBolo = boloRepository.save(boloEntity);
        return mapToDTO(savedBolo);
    }

    @Override
    public BoloDTO updateBolo(Long id, BoloDTO boloDTO) {
        // Check if the Bolo exists
        Bolo existingBolo = boloRepository.findById(id).orElse(null);
        if (existingBolo == null) {
            throw new ResourceNotFoundException("Bolo not found");
        }
        // Update the Bolo entity
        existingBolo.setInspectionPayment(boloDTO.getInspectionPayment());
        existingBolo.setRoadFundPayment(boloDTO.getRoadFundPayment());
        existingBolo.setBoloPayment(boloDTO.getBoloPayment());
        existingBolo.setBoloExpiredDate(boloDTO.getBoloExpiredDate());
        existingBolo.setVehicle(vehicleRepository.findById(boloDTO.getVehicleId()).orElse(null));
        Bolo updatedBolo = boloRepository.save(existingBolo);
        return mapToDTO(updatedBolo);
    }

    @Override
    public void deleteBolo(Long id) {
        // Check if the Bolo exists
        Bolo existingBolo = boloRepository.findById(id).orElse(null);
        if (existingBolo == null) {
            throw new ResourceNotFoundException("Bolo not found");
        }
        boloRepository.delete(existingBolo);
    }

    @Override
    public BoloDTO getBoloById(Long id) {
        Bolo existingBolo = boloRepository.findById(id).orElse(null);
        if (existingBolo == null) {
            throw new ResourceNotFoundException("Bolo not found");
        }
        return mapToDTO(existingBolo);
    }

    // mapping methods
    private BoloDTO mapToDTO(Bolo boloEntity) {
        return BoloDTO.builder()
                .id(boloEntity.getId())
                .inspectionPayment(boloEntity.getInspectionPayment())
                .roadFundPayment(boloEntity.getRoadFundPayment())
                .boloPayment(boloEntity.getBoloPayment())
                .boloExpiredDate(boloEntity.getBoloExpiredDate())
                .vehicle(vehicleService.mapToDTO(boloEntity.getVehicle()))
                .build();
    }

    private Bolo mapToEntity(BoloDTO boloDTO) {
        return Bolo.builder()
                .id(boloDTO.getId())
                .inspectionPayment(boloDTO.getInspectionPayment())
                .roadFundPayment(boloDTO.getRoadFundPayment())
                .boloPayment(boloDTO.getBoloPayment())
                .boloExpiredDate(boloDTO.getBoloExpiredDate())
                .vehicle(vehicleRepository.findById(boloDTO.getVehicleId()).orElse(null))
                .build();
    }

    @Override
    public List<BoloDTO> bulkImportBolos(List<BoloDTO> boloDTOs) {
        List<BoloDTO> created = new ArrayList<>();
        for (BoloDTO dto : boloDTOs) {
            // If vehicleId is not provided but plateNumber is, look up vehicleId
            if ((dto.getVehicleId() == null || dto.getVehicleId() == 0L) && dto.getPlateNumber() != null) {
                vehicleRepository.findByPlateNumber(dto.getPlateNumber())
                    .ifPresent(vehicle -> dto.setVehicleId(vehicle.getId()));
            }
            // Only import if vehicleId is now set
            if (dto.getVehicleId() != null && dto.getVehicleId() != 0L) {
                created.add(createBolo(dto));
            }
            else {
                System.out.println("Skipping BOLO entry: " + dto);
            }
        }
        return created;
    }
}
