package com.zemenbank.fleetmanagement.service;

import java.util.List;

import com.zemenbank.fleetmanagement.dto.PreApprovedTripDTO;

public interface PreApprovedTripService {
    // crud for pre-approved trip
    PreApprovedTripDTO createPreApprovedTrip(PreApprovedTripDTO preApprovedTripDTO);
    PreApprovedTripDTO updatePreApprovedTrip(Long id, PreApprovedTripDTO preApprovedTripDTO);
    void deletePreApprovedTrip(Long id);
    PreApprovedTripDTO getPreApprovedTripById(Long id);
    List<PreApprovedTripDTO> getAllPreApprovedTrips();
    
}
