package com.zemenbank.fleetmanagement.service;


import com.zemenbank.fleetmanagement.dto.ComputerDTO;
import java.util.List;

public interface ComputerService {
    ComputerDTO register(ComputerDTO dto);
    ComputerDTO getById(Long id);
    ComputerDTO getByQrCode(String qrCode);
    List<ComputerDTO> getAll();
  
    ComputerDTO generateQrCode(String serialNumber);

} 