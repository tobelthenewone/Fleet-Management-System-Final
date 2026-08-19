package com.zemenbank.fleetmanagement.service;
import java.util.List;

import com.zemenbank.fleetmanagement.dto.JourneyDTO;
import com.zemenbank.fleetmanagement.dto.report.JourneyStartInput;
import com.zemenbank.fleetmanagement.enums.JourneyStatus;
import com.zemenbank.fleetmanagement.enums.PreApprovedRequestParameter;

public interface JourneyService {
    List<JourneyDTO> startJourney(Long requestId, List<JourneyStartInput> journeyInputs);
    List<JourneyDTO> startJourney( PreApprovedRequestParameter requestParameter);
    JourneyDTO endJourney(Long journeyId, Double endingKilometer);
    JourneyDTO getJourneyById(Long id);
    List<JourneyDTO> getAllJourneys();
    List<JourneyDTO> getJourneysByVehicleId(Long vehicleId);
    List<JourneyDTO> getJourneysByStatus(JourneyStatus status);
    JourneyDTO updateJourney(Long id, JourneyDTO journeyDTO);
    void deleteJourney(Long id);
}
