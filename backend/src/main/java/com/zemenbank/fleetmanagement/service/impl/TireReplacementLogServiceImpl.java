package com.zemenbank.fleetmanagement.service.impl;

import com.zemenbank.fleetmanagement.dto.TireReplacementLogDTO;
import com.zemenbank.fleetmanagement.dto.UserBriefDTO;
import com.zemenbank.fleetmanagement.enums.TireStatus;
import com.zemenbank.fleetmanagement.model.TireReplacementLog;
import com.zemenbank.fleetmanagement.model.TireReplacementRequest;
import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.TireReplacementLogRepository;
import com.zemenbank.fleetmanagement.repository.TireReplacementRequestRepository;
import com.zemenbank.fleetmanagement.repository.UserRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.TireReplacementLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TireReplacementLogServiceImpl implements TireReplacementLogService {

        private final TireReplacementLogRepository logRepository;
        private final TireReplacementRequestRepository requestRepository;
        private final VehicleRepository vehicleRepository;
        private final UserRepository userRepository;

        @Override
        public void logReplacement(TireReplacementLogDTO dto, User officer) {
                TireReplacementRequest request = requestRepository.findById(dto.getRequestId())
                                .orElseThrow(() -> new RuntimeException("Request not found"));

                if (request.getStatus() != TireStatus.APPROVED) {
                        throw new RuntimeException("Only approved requests can be logged");
                }

                Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

                TireReplacementLog log = toEntity(dto);
                log.setRequest(request);
                log.setVehicle(vehicle);
                log.setReplacedBy(officer);
                logRepository.save(log);

                request.setStatus(TireStatus.LOGGED);
                requestRepository.save(request);
        }

        @Override
        public List<TireReplacementLogDTO> getAllLogs() {
                return logRepository.findAll()
                                .stream()
                                .map(this::toDto)
                                .collect(Collectors.toList());
        }

        @Override
        public TireReplacementLogDTO getLogById(Long id) {
                TireReplacementLog log = logRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Log not found"));
                return toDto(log);
        }

        @Override
        public TireReplacementLogDTO updateLog(Long id, TireReplacementLogDTO dto) {
                TireReplacementLog log = logRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Log not found"));

                log.setOldTireBrand(dto.getOldTireBrand());
                log.setOldTireSerialNumber(dto.getOldTireSerialNumber());
                log.setOldTireMountDate(dto.getOldTireMountDate());
                log.setNewTireBrand(dto.getNewTireBrand());
                log.setNewTireSerialNumber(dto.getNewTireSerialNumber());
                log.setNewTireMountDate(dto.getNewTireMountDate());
                log.setOdometerAtReplacement(dto.getOdometerAtReplacement());

                logRepository.save(log);
                return toDto(log);
        }

        @Override
        public void deleteLog(Long id) {
                logRepository.deleteById(id);
        }

        // === Mapping Methods ===
        private TireReplacementLogDTO toDto(TireReplacementLog log) {
                return TireReplacementLogDTO.builder()
                                .id(log.getId())
                                .requestId(log.getRequest().getId())
                                .vehicleId(log.getVehicle().getId())
                                .oldTireBrand(log.getOldTireBrand())
                                .oldTireSerialNumber(log.getOldTireSerialNumber())
                                .oldTireMountDate(log.getOldTireMountDate())
                                .newTireBrand(log.getNewTireBrand())
                                .newTireSerialNumber(log.getNewTireSerialNumber())
                                .newTireMountDate(log.getNewTireMountDate())
                                .odometerAtReplacement(log.getOdometerAtReplacement())
                                .dateOfReplacement(log.getDateOfReplacement())

                                .replacedBy(UserBriefDTO.builder()
                                                .id(log.getReplacedBy().getId())
                                                .name(log.getReplacedBy().getUsername())
                                                .username(log.getReplacedBy().getUsername() + "@zemenbank.com")
                                                .role(log.getReplacedBy().getRole())
                                                .build())
                                .plateNumber(log.getVehicle().getPlateNumber())
                                .build();
        }

        private TireReplacementLog toEntity(TireReplacementLogDTO dto) {
                User replacedBy = userRepository.findById(dto.getReplacedById())
                                .orElseThrow(() -> new RuntimeException("Replaced by user not found"));
                return TireReplacementLog.builder()
                                .oldTireBrand(dto.getOldTireBrand())
                                .oldTireSerialNumber(dto.getOldTireSerialNumber())
                                .oldTireMountDate(dto.getOldTireMountDate())
                                .newTireBrand(dto.getNewTireBrand())
                                .newTireSerialNumber(dto.getNewTireSerialNumber())
                                .newTireMountDate(dto.getNewTireMountDate())
                                .odometerAtReplacement(dto.getOdometerAtReplacement())
                                .replacedBy(replacedBy)
                                .dateOfReplacement(
                                                dto.getDateOfReplacement() != null ? dto.getDateOfReplacement()
                                                                : java.time.LocalDate.now())
                                .build();
        }
}
