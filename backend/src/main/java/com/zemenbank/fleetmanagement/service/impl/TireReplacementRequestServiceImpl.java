package com.zemenbank.fleetmanagement.service.impl;


import com.zemenbank.fleetmanagement.dto.TireReplacementRequestDTO;
import com.zemenbank.fleetmanagement.dto.UserBriefDTO;
import com.zemenbank.fleetmanagement.dto.VehicleDTO;
import com.zemenbank.fleetmanagement.enums.TireStatus;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.*;
import com.zemenbank.fleetmanagement.repository.TireReplacementLogRepository;
import com.zemenbank.fleetmanagement.repository.TireReplacementRequestRepository;
// import com.zemenbank.fleetmanagement.repository.UserRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.TireReplacementRequestService;
import com.zemenbank.fleetmanagement.service.VehicleService;
// import com.zemenbank.fleetmanagement.service.DepartmentService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TireReplacementRequestServiceImpl implements TireReplacementRequestService {

    private final TireReplacementRequestRepository requestRepository;
    private final TireReplacementLogRepository logRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleService vehicleService;

    // private final UserRepository userRepository;
    // private final DepartmentService departmentServiceImpl;

    // CREATE
    @Override
    public TireReplacementRequestDTO createRequest(TireReplacementRequestDTO dto) {
        TireReplacementRequest entity = mapToEntity(dto);
        TireReplacementRequest saved = requestRepository.save(entity);
        return mapToDTO(saved);

    }

    @Override
    public List<TireReplacementRequestDTO> getAllRequests() {
        List<TireReplacementRequest> requests = requestRepository.findAll();
        return requests.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public TireReplacementRequestDTO updateRequest(Long id, TireReplacementRequestDTO dto) {
        TireReplacementRequest existing = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id " + id));

        existing.setReasonForReplacement(dto.getReasonForReplacement());
        existing.setCurrentOdometer(dto.getCurrentOdometer());
        existing.setOldTireBrand(dto.getOldTireBrand());
        existing.setOldTireSerialNumber(dto.getOldTireSerialNumber());
        existing.setOldTireMountDate(dto.getOldTireMountDate());
        existing.setTirePosition(dto.getTirePosition());
        existing.setOdometerAtMounting(dto.getOdometerAtMounting());
        existing.setDateOfRequest(dto.getDateOfRequest());
        existing.setStatus(TireStatus.PENDING);
        // Reset status to PENDING on update
        // Add any additional fields you want to update

        TireReplacementRequest updated = requestRepository.save(existing);
        return mapToDTO(updated);
    }

    @Override
    public void deleteRequest(Long id) {
        if (!requestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Request not found with id " + id);
        }
        requestRepository.deleteById(id);
    }

    @Override
    public TireReplacementRequestDTO getRequestById(Long id) {
        TireReplacementRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id " + id));
        return mapToDTO(request);
    }

    @Override
    public void rejectRequest(Long id, User currentUser) {
        TireReplacementRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() == TireStatus.REJECTED) {
            throw new RuntimeException("Request is already rejected");
        }

        request.setStatus(TireStatus.REJECTED);
        request.setRejectedBy(currentUser); // Assuming you have this field in entity
        requestRepository.save(request);
    }

    public void verifyRequest(Long requestId, User verifier) {
        TireReplacementRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setVerifiedBy(verifier);
        request.setVerifiedDate(LocalDate.now());
        request.setStatus(TireStatus.VERIFIED);
        requestRepository.save(request);
    }

    public void approveRequest(Long requestId, User approver) {
        TireReplacementRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getVerifiedBy() == null) {
            throw new RuntimeException("Request must be verified before approval");
        }

        request.setApprovedBy(approver);
        request.setApprovedDate(LocalDate.now());
        request.setStatus(TireStatus.APPROVED);
        requestRepository.save(request);
    }

    // Mapping
    private TireReplacementRequestDTO mapToDTO(TireReplacementRequest entity) {
        VehicleDTO vehicle = vehicleService.getVehicleById(entity.getVehicle().getId());

        // Step 1: Create DTO
        TireReplacementRequestDTO dto = TireReplacementRequestDTO.builder()
                .id(entity.getId())
                .vehicleId(entity.getVehicle().getId())
                .vehicle(vehicle)
                .dateOfRequest(entity.getDateOfRequest())
                .oldTireMountDate(entity.getOldTireMountDate())
                .oldTireBrand(entity.getOldTireBrand())
                .oldTireSerialNumber(entity.getOldTireSerialNumber())
                .tirePosition(entity.getTirePosition())
                .odometerAtMounting(entity.getOdometerAtMounting())
                .currentOdometer(entity.getCurrentOdometer())
                .reasonForReplacement(entity.getReasonForReplacement())
                .status(entity.getStatus())
                .requester(entity.getRequestedBy() != null ? UserBriefDTO.builder()
                        .id(entity.getRequestedBy().getId())
                        .name(entity.getRequestedBy().getName())
                        .username(entity.getRequestedBy().getUsername())
                        .role(entity.getRequestedBy().getRole())
                        .build() : null)
                .approvedBy(entity.getApprovedBy() != null ? UserBriefDTO.builder()
                        .id(entity.getApprovedBy().getId())
                        .name(entity.getApprovedBy().getName())
                        .username(entity.getApprovedBy().getUsername())
                        .role(entity.getApprovedBy().getRole())
                        .build() : null)
                .verifiedBy(entity.getVerifiedBy() != null ? UserBriefDTO.builder()
                        .id(entity.getVerifiedBy().getId())
                        .name(entity.getVerifiedBy().getName())
                        .username(entity.getVerifiedBy().getUsername())
                        .role(entity.getVerifiedBy().getRole())
                        .build() : null)
                .rejectedBy(entity.getRejectedBy() != null ? UserBriefDTO.builder()
                        .id(entity.getRejectedBy().getId())
                        .name(entity.getRejectedBy().getName())
                        .username(entity.getRejectedBy().getUsername())
                        .role(entity.getRejectedBy().getRole())
                        .build() : null)
                .build();

        // Step 2: Add log fields if LOGGED
        if (entity.getStatus() == TireStatus.LOGGED) {
            logRepository.findByRequestId(entity.getId()).ifPresent(log -> {
                dto.setNewTireBrand(log.getNewTireBrand());
                dto.setNewTireSerialNumber(log.getNewTireSerialNumber());
                dto.setNewTireMountDate(log.getNewTireMountDate());
                dto.setOdometerAtReplacement(log.getOdometerAtReplacement());
                dto.setReplacedBy(log.getReplacedBy() != null ? UserBriefDTO.builder()
                        .id(log.getReplacedBy().getId())
                        .name(log.getReplacedBy().getName())
                        .username(log.getReplacedBy().getUsername() + "@zemenbank.com")
                        .role(log.getReplacedBy().getRole())
                        .build() : null);
            });
        }

        // Step 3: Return DTO
        return dto;
    }

    private TireReplacementRequest mapToEntity(TireReplacementRequestDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + dto.getVehicleId()));

        return TireReplacementRequest.builder()
                .requestedBy((User) authentication.getPrincipal())
                .vehicle(vehicle)
                .dateOfRequest(dto.getDateOfRequest())
                .oldTireMountDate(dto.getOldTireMountDate())
                .oldTireBrand(dto.getOldTireBrand())
                .oldTireSerialNumber(dto.getOldTireSerialNumber())
                .tirePosition(dto.getTirePosition())
                .odometerAtMounting(dto.getOdometerAtMounting())
                .currentOdometer(dto.getCurrentOdometer())
                .reasonForReplacement(dto.getReasonForReplacement())
                .status(TireStatus.PENDING) // Default status
                .build();

    }

    // private UserBriefDTO mapToUserBriefDTO(User user) {
    // if (user == null)
    // return null;

    // return UserBriefDTO.builder()
    // .id(user.getId())
    // .name(user.getName())
    // .username(user.getUsername())
    // .role(user.getRole())
    // .build();
    // }

}
