package com.zemenbank.fleetmanagement.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.dto.PreApprovedTripDTO;
import com.zemenbank.fleetmanagement.enums.AssignmentType;
import com.zemenbank.fleetmanagement.enums.VehicleCategory;
import com.zemenbank.fleetmanagement.model.PreApprovedTrip;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.DepartmentRepository;
import com.zemenbank.fleetmanagement.repository.PreApprovedTripRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.PreApprovedTripService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PreApprovedTripServiceImpl implements PreApprovedTripService {
    private final VehicleServiceImpl vehicleServiceImpl;
    private final DepartmentServiceImpl departmentServiceImpl;

    private final DepartmentRepository departmentRepository;
    private final VehicleRepository vehicleRepository;
    private final PreApprovedTripRepository preApprovedTripRepository;

    @Override
    public PreApprovedTripDTO createPreApprovedTrip(PreApprovedTripDTO preApprovedTripDTO) {
        PreApprovedTrip preApprovedTrip = mapToEntity(preApprovedTripDTO);
        PreApprovedTrip savedTrip = preApprovedTripRepository.save(preApprovedTrip);
        return mapToDTO(savedTrip);
    }

    @Override
    public PreApprovedTripDTO updatePreApprovedTrip(Long id, PreApprovedTripDTO preApprovedTripDTO) {
        PreApprovedTrip existingTrip = preApprovedTripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PreApprovedTrip not found with id: " + id));
        /*
         * fetch associated vehicles with this
         * and then revert their vehicle category to general if their id is not in the
         * preApprovedTripDTO vehicleIds list or change their category based on the current
         * assignment type
         */
        List<Vehicle> existingVehicles = vehicleRepository.findAllByPreApprovedTripId(id);
        existingVehicles.forEach(vehicle -> {
            if (!preApprovedTripDTO.getVehicleIds().contains(vehicle.getId())) {
                vehicle.setVehicleCategory(VehicleCategory.GENERAL);
            } else {
                // if assignment type is full-time then set vehicle category to Department Exclusive
                if (preApprovedTripDTO.getAssignmentType() == AssignmentType.FULL_TIME) {
                    vehicle.setVehicleCategory(VehicleCategory.DEPARTMENT_EXCLUSIVE);
                }
                // if assignment type is night shift then set vehicle category to Department Scheduled
                else if (preApprovedTripDTO.getAssignmentType() == AssignmentType.NIGHT_SHIFT) {
                    vehicle.setVehicleCategory(VehicleCategory.DEPARTMENT_SCHEDULED);
                }
            }
        });
        
        // Update fields as necessary
        existingTrip.setDepartment(
                departmentRepository.findById(preApprovedTripDTO.getDepartmentId())
                        .orElseThrow(() -> new RuntimeException("Department not found"))
        );
        existingTrip.setVehicles(vehicleRepository.findAllById(preApprovedTripDTO.getVehicleIds()));
        existingTrip.setAssignmentType(preApprovedTripDTO.getAssignmentType());

        PreApprovedTrip updatedTrip = preApprovedTripRepository.save(existingTrip);
        return mapToDTO(updatedTrip);
    }

    @Override
    public void deletePreApprovedTrip(Long id) {
        preApprovedTripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PreApprovedTrip not found with id: " + id));

        // Reverse the vehicle category to general
        List<Vehicle> vehicles = vehicleRepository.findAllByPreApprovedTripId(id);
        System.out.println("Vehicles to be updated to general: " + vehicles.size());
        
        vehicles.forEach(vehicle -> {
                vehicle.setVehicleCategory(VehicleCategory.GENERAL);
                vehicle.setPreApprovedTrip(null); // break the link
        });

        vehicleRepository.saveAll(vehicles);

        preApprovedTripRepository.deleteById(id);
        }


    @Override
    public PreApprovedTripDTO getPreApprovedTripById(Long id) {
        PreApprovedTrip existingTrip = preApprovedTripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PreApprovedTrip not found with id: " + id));
        return mapToDTO(existingTrip);
    }
    @Override
    public List<PreApprovedTripDTO> getAllPreApprovedTrips() {
        List<PreApprovedTrip> trips = preApprovedTripRepository.findAll();
        return trips.stream()
                .map(this::mapToDTO)
                .toList();
    }




    // mapping methods can be added here to convert between PreApprovedTrip and PreApprovedTripDTO

    PreApprovedTripDTO mapToDTO(PreApprovedTrip preApprovedTrip) {
        return PreApprovedTripDTO.builder()
                .id(preApprovedTrip.getId())
                .department(preApprovedTrip.getDepartment() != null ?
                        departmentServiceImpl.mapToDTO(preApprovedTrip.getDepartment()) : null)
                .vehicles(preApprovedTrip.getVehicles().stream()
                        .map(vehicleServiceImpl::mapToDTO)
                        .toList())
                .assignmentType(null != preApprovedTrip.getAssignmentType() ?
                        preApprovedTrip.getAssignmentType() : null)
                .build();
    }

    PreApprovedTrip mapToEntity(PreApprovedTripDTO preApprovedTripDTO) {

        // if assignment type is full-time then set vehicle category to Department Exclusive
        if (preApprovedTripDTO.getAssignmentType() == AssignmentType.FULL_TIME) {
                // fetch the vehicles by their IDs and set the vehicle category to Department Exclusive
            List<Vehicle> vehicles = vehicleRepository.findAllById(preApprovedTripDTO.getVehicleIds());
            vehicles.forEach(vehicle -> vehicle.setVehicleCategory(VehicleCategory.DEPARTMENT_EXCLUSIVE));
            vehicleRepository.saveAll(vehicles);
        }
        // if assignment type is night shift then set vehicle category to Department Scheduled
        else if (preApprovedTripDTO.getAssignmentType() == AssignmentType.NIGHT_SHIFT) {
           List<Vehicle> vehicles = vehicleRepository.findAllById(preApprovedTripDTO.getVehicleIds());
            vehicles.forEach(vehicle -> vehicle.setVehicleCategory(VehicleCategory.DEPARTMENT_SCHEDULED));
            vehicleRepository.saveAll(vehicles);
        } else {
            System.out.println("condition not met for assignment type=" + (preApprovedTripDTO.getAssignmentType() == AssignmentType.FULL_TIME));
            System.out.println("assignment type=" + preApprovedTripDTO.getAssignmentType());
                
        }

        return PreApprovedTrip.builder()
                .department(
                        departmentRepository.findById(preApprovedTripDTO.getDepartmentId())
                                .orElseThrow(() -> new RuntimeException("Department not found"))
                )
                .vehicles(vehicleRepository.findAllById(preApprovedTripDTO.getVehicleIds()))
                .assignmentType(preApprovedTripDTO.getAssignmentType())
                .build();
    }
    
}
    