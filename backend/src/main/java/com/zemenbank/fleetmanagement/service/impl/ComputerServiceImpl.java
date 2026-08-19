package com.zemenbank.fleetmanagement.service.impl;


import com.zemenbank.fleetmanagement.dto.ComputerDTO;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Computer;
import com.zemenbank.fleetmanagement.repository.ComputerRepository;
import com.zemenbank.fleetmanagement.service.ComputerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComputerServiceImpl implements ComputerService {

    private final ComputerRepository computerRepository;

   @Override
public ComputerDTO register(ComputerDTO dto) {
    Computer computer = Computer.builder()
            .ownerName(dto.getOwnerName())
            .serialNumber(dto.getSerialNumber())
            .model(dto.getModel())
            .ownershipType(dto.getOwnershipType())
            .build(); // No qrCode generated here
    return mapToDTO(computerRepository.save(computer));
}


    @Override
    public ComputerDTO getById(Long id) {
        return computerRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Computer not found with id: " + id));
    }

    @Override
    public ComputerDTO getByQrCode(String qrCode) {
        return computerRepository.findByQrCode(qrCode)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Computer not found with QR Code: " + qrCode));
    }


    @Override
    public List<ComputerDTO> getAll() {
        return computerRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    @Override
public ComputerDTO generateQrCode(String serialNumber) {
    Computer computer = computerRepository.findBySerialNumber(serialNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Computer not found with serial number: " + serialNumber));


  String qrData = String.format(
    "{\"serialNumber\":\"%s\", \"ownerName\":\"%s\", \"ownershipType\":\"%s\", \"model\":\"%s\"}",
    computer.getSerialNumber(),
    computer.getOwnerName(),
    computer.getOwnershipType(),
    computer.getModel()
);
computer.setQrCode(qrData);

    return mapToDTO(computerRepository.save(computer));
}


    private ComputerDTO mapToDTO(Computer c) {
        return ComputerDTO.builder()
                .id(c.getId())
                .ownerName(c.getOwnerName())
                .serialNumber(c.getSerialNumber())
                .model(c.getModel())
                .ownershipType(c.getOwnershipType())
                .qrCode(c.getQrCode())
                .build();
    }
} 