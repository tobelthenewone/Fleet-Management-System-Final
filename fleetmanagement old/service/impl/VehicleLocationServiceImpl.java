package com.zemenbank.fleetmanagement.service.impl;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.dto.VehicleLocationRequestDTO;
import com.zemenbank.fleetmanagement.model.VehicleLocation;
import com.zemenbank.fleetmanagement.repository.VehicleLocationRepository;
import com.zemenbank.fleetmanagement.service.VehicleLocationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehicleLocationServiceImpl implements VehicleLocationService {

    private final VehicleLocationRepository locationRepository;


    @Override
    public VehicleLocation saveLocation(Long vehicleId, VehicleLocationRequestDTO request) {
        VehicleLocation location = new VehicleLocation();
        location.setVehicleId(vehicleId);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setSpeed(request.getSpeed());
        location.setTimestamp(LocalDateTime.now());

        return locationRepository.save(location);
    }

    @Override
    public VehicleLocation getLatestLocation(Long vehicleId) {
        return locationRepository.findTopByVehicleIdOrderByTimestampDesc(vehicleId);
    }

    @Override
    public List<VehicleLocation> getAllLocations() {
        return locationRepository.findAll();
    }
}

