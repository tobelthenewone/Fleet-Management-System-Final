// TireReplacementRequestService.java
package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.TireReplacementLogDTO;
import com.zemenbank.fleetmanagement.dto.TireReplacementRequestDTO;
import com.zemenbank.fleetmanagement.model.User;
import java.util.List;

public interface TireReplacementRequestService {

    TireReplacementRequestDTO createRequest(TireReplacementRequestDTO dto);

    void verifyRequest(Long requestId, User verifier);

    void rejectRequest(Long requestId, User rejector);

    void approveRequest(Long requestId, User approver);

    TireReplacementRequestDTO getRequestById(Long id);

    List<TireReplacementRequestDTO> getAllRequests();

    TireReplacementRequestDTO updateRequest(Long id, TireReplacementRequestDTO dto);

    void deleteRequest(Long id);
}
