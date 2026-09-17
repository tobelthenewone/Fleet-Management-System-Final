package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.TireReplacementLogDTO;
import com.zemenbank.fleetmanagement.model.User;

import java.util.List;

public interface TireReplacementLogService {
    void logReplacement(TireReplacementLogDTO dto, User officer);
    List<TireReplacementLogDTO> getAllLogs();
    TireReplacementLogDTO getLogById(Long id);
    TireReplacementLogDTO updateLog(Long id, TireReplacementLogDTO dto);
    void deleteLog(Long id);
}
