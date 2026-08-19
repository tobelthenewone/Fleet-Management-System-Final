package com.zemenbank.fleetmanagement.service.impl;

import com.zemenbank.fleetmanagement.dto.AccidentDTO;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Accident;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.AccidentRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.AccidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccidentServiceImpl implements AccidentService {

    private final AccidentRepository accidentRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    public AccidentDTO createAccident(AccidentDTO accidentDTO) {
        Vehicle vehicle = vehicleRepository.findById(accidentDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + accidentDTO.getVehicleId()));
        
        Accident accident = mapToEntity(accidentDTO);
        accident.setVehicle(vehicle);
        Accident savedAccident = accidentRepository.save(accident);
        return mapToDTO(savedAccident);
    }

    @Override
    public AccidentDTO getAccidentById(Long id) {
        Accident accident = accidentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Accident not found with id: " + id));
        return mapToDTO(accident);
    }

    @Override
    public List<AccidentDTO> getAllAccidents() {
        return accidentRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<AccidentDTO> getAccidentsByVehicleId(Long vehicleId) {
        return accidentRepository.findByVehicleId(vehicleId).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public AccidentDTO updateAccident(Long id, AccidentDTO accidentDTO) {
        Accident existingAccident = accidentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Accident not found with id: " + id));

        Vehicle vehicle = vehicleRepository.findById(accidentDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + accidentDTO.getVehicleId()));

        existingAccident.setAccidentDate(accidentDTO.getAccidentDate());
        existingAccident.setFault(accidentDTO.getFault());
        existingAccident.setInsuranceClaim(accidentDTO.getInsuranceClaim());
        existingAccident.setPoliceReport(accidentDTO.getPoliceReport());
        existingAccident.setRemark(accidentDTO.getRemark());
        existingAccident.setVehicle(vehicle);

        Accident updatedAccident = accidentRepository.save(existingAccident);
        return mapToDTO(updatedAccident);
    }

    @Override
    public void deleteAccident(Long id) {
        Accident accident = accidentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Accident not found with id: " + id));
        accidentRepository.delete(accident);
    }

    private Accident mapToEntity(AccidentDTO dto) {
        return Accident.builder()
            .id(dto.getId())
            .accidentDate(dto.getAccidentDate())
            .fault(dto.getFault())
            .insuranceClaim(dto.getInsuranceClaim())
            .policeReport(dto.getPoliceReport())
            .remark(dto.getRemark())
            .insuranceClaimedAt(dto.getInsuranceClaimedAt())
            .policeReportedAt(dto.getPoliceReportedAt())
            .insuranceSurveyedAt(dto.getInsuranceSurveyedAt())
            .repairedAt(dto.getRepairedAt())
            .releasedAt(dto.getReleasedAt())
            .build();
    }

    private AccidentDTO mapToDTO(Accident accident) {
        return AccidentDTO.builder()
            .id(accident.getId())
            .accidentDate(accident.getAccidentDate())
            .fault(accident.getFault())
            .insuranceClaim(accident.getInsuranceClaim())
            .policeReport(accident.getPoliceReport())
            .remark(accident.getRemark())
            .vehicleId(accident.getVehicle().getId())
            .insuranceClaimedAt(accident.getInsuranceClaimedAt())
            .policeReportedAt(accident.getPoliceReportedAt())
            .insuranceSurveyedAt(accident.getInsuranceSurveyedAt())
            .repairedAt(accident.getRepairedAt())
            .releasedAt(accident.getReleasedAt())
            .build();
    }

    public AccidentDTO updateAccidentStatus(Long id, String status) {
        Accident accident = accidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Accident not found with id: " + id));

        LocalDateTime now = LocalDateTime.now();
        switch (status) {
            case "INSURANCE_CLAIMED":
                accident.setInsuranceClaimedAt(now);
                break;
            case "POLICE_REPORTED":
                accident.setPoliceReportedAt(now);
                break;
            case "INSURANCE_SURVEYED":
                accident.setInsuranceSurveyedAt(now);
                break;
            case "REPAIRED":
                accident.setRepairedAt(now);
                break;
            case "RELEASED":
                accident.setReleasedAt(now);
                break;
            default:
                throw new IllegalArgumentException("Invalid status: " + status);
        }

        Accident updatedAccident = accidentRepository.save(accident);
        return mapToDTO(updatedAccident);
    }
} 