package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.MaintRequestDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MaintRequestService {
    MaintRequestDTO createRequest(MaintRequestDTO dto);

    List<MaintRequestDTO> getAllRequests();


    MaintRequestDTO getRequestById(Long id);

    MaintRequestDTO updateRequest(Long id, MaintRequestDTO dto);

    void deleteRequest(Long id);
}
