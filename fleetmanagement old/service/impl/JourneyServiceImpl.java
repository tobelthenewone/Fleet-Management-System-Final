package com.zemenbank.fleetmanagement.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zemenbank.fleetmanagement.dto.JourneyDTO;
import com.zemenbank.fleetmanagement.dto.UserBriefDTO;
import com.zemenbank.fleetmanagement.dto.report.JourneyStartInput;
import com.zemenbank.fleetmanagement.enums.JourneyStatus;
import com.zemenbank.fleetmanagement.enums.PreApprovedRequestParameter;
import com.zemenbank.fleetmanagement.enums.TripType;
import com.zemenbank.fleetmanagement.enums.VehicleStatus;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Department;
import com.zemenbank.fleetmanagement.model.Journey;
import com.zemenbank.fleetmanagement.model.Request;
import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.model.Vehicle;
import com.zemenbank.fleetmanagement.repository.DepartmentRepository;
import com.zemenbank.fleetmanagement.repository.JourneyRepository;
import com.zemenbank.fleetmanagement.repository.RequestRepository;
import com.zemenbank.fleetmanagement.repository.UserRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;
import com.zemenbank.fleetmanagement.service.JourneyService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JourneyServiceImpl implements JourneyService {

    private final JourneyRepository journeyRepository;
    private final RequestRepository requestRepository;
    private final DriverServiceImpl driverServiceImpl;
    private final VehicleServiceImpl vehicleServiceImpl;
    private final VehicleRepository vehicleRepository;
    private final DepartmentRepository departmentRepository;
    private final DepartmentServiceImpl departmentServiceImpl;
    private final UserRepository userRepository;
    private final UserServiceImpl userServiceImpl;
    private final RequestServiceImpl requestServiceImpl;

    @Override
    @Transactional
    public List<JourneyDTO> startJourney(Long requestId, List<JourneyStartInput> journeyInputs) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id " + requestId));

        if (request.getStatus() != 4) {
            throw new IllegalStateException("Request must be approved by logistics head before starting journey");
        }

        if (journeyRepository.existsByRequestIdAndStatus(requestId, JourneyStatus.IN_PROGRESS)) {
            throw new IllegalStateException("A journey is already in progress for this request");
        }

        // Update request status to in progress
        request.setStatus(5);
        request.setStartingJourneyTime(LocalDateTime.now());
        requestRepository.save(request);

        // update status of merged requests to in progress
        List<Request> mergedRequests = request.getMergedRequests();
        for (Request mergedRequest : mergedRequests) {
            mergedRequest.setStatus(5);
            mergedRequest.setStartingJourneyTime(LocalDateTime.now());
            requestRepository.save(mergedRequest);
        }

        List<Vehicle> requestVehicles = request.getVehicles();
        if (requestVehicles == null || requestVehicles.isEmpty()) {
            throw new IllegalStateException("No vehicles assigned to this request");
        }

        // Validate that all vehicles have kilometer readings
        Map<Long, Double> startKilometerMap = journeyInputs.stream()
                .collect(Collectors.toMap(JourneyStartInput::getVehicleId, JourneyStartInput::getStartKilometer));

        for (Vehicle vehicle : requestVehicles) {
            if (!startKilometerMap.containsKey(vehicle.getId())) {
                throw new IllegalArgumentException("Missing starting kilometer for vehicle ID: " + vehicle.getId());
            }
        }

        List<JourneyDTO> savedJourneys = new ArrayList<>();
        LocalDateTime startTime = LocalDateTime.now();

        for (Vehicle vehicle : requestVehicles) {
            Double startKm = startKilometerMap.get(vehicle.getId());

            Journey journey = Journey.builder()
                    .request(request)
                    .vehicle(vehicle)
                    .driver(vehicle.getDriver())
                    .startTime(startTime)
                    .endLocation(request.getDestination())
                    .purpose(request.getPurpose())
                    .startingKilometer(startKm)
                    .status(JourneyStatus.IN_PROGRESS)
                    .department(request.getDepartment())
                    .build();

            Journey savedJourney = journeyRepository.save(journey);
            savedJourneys.add(convertToDTO(savedJourney));
        }

        return savedJourneys;
    }

        @Override
    public List<JourneyDTO> startJourney(PreApprovedRequestParameter requestParameter) {
        // this is for pre approved requests
        /**
         * 1) parameters include department id and vehicle id with their starting kilometers
         * 2) find all vehicles in the department
         * 3) for each vehicle, create a journey with the provided starting kilometers
         * 4) fetch department using department id parameter
         * 5) create a journey for each vehicle with the provided starting kilometers
         */
        Department department = departmentRepository.findById(requestParameter.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id " + requestParameter.getDepartmentId()));
        // List of users (travelers)
        List<Long> travelerIds = requestParameter.getTravelerIds();
        List<User> travelers = userRepository.findAllByIdIn(travelerIds);       
        if (travelers.isEmpty()) {
            throw new IllegalStateException("No travelers found for the provided IDs");
        }

        List<JourneyStartInput> journeyInputs = requestParameter.getJourneyStartInput();
        List<Long> vehicleIds = journeyInputs.stream()
            .map(JourneyStartInput::getVehicleId)
            .collect(Collectors.toList());
        List<Vehicle> vehicles = vehicleRepository.findAllByIdIn(vehicleIds);
        /**
         * create request with travelers, purpose = "pre-approved journey", department = department, vehicles= vehicles
         *  tripType = "pre-approved"
         *                 .requester((User) authentication.getPrincipal())
         */
        // Request request =
        //         requestRepository.save( Request.builder()
        //             .requester((User) (SecurityContextHolder.getContext().getAuthentication()).getPrincipal())
        //             .travelers(travelers)
        //             .purpose("pre-approved journey")
        //             .department(department)
        //             .vehicles(vehicles)
        //             .startTime(LocalDateTime.now().toString())
        //             .tripType(TripType.CITY_TRIP)
        //             .createdAt(new Date().toString())
        //             .status(5)
        //             .build()
        //         );

        var journeyDTOs = new ArrayList<JourneyDTO>();

        for (Vehicle vehicle : vehicles) {
            Double startKm = journeyInputs.stream()
                    .filter(input -> input.getVehicleId().equals(vehicle.getId()))
                    .map(JourneyStartInput::getStartKilometer)
                    .findFirst()
                    .orElse(0.0);

            Journey journey = Journey.builder()
                    // .request(request)
                    .vehicle(vehicle)
                    .driver(vehicle.getDriver())
                    .startTime(LocalDateTime.now())
                    .endLocation("Unknown")
                    .purpose("pre-approved journey -- " + department.getName())
                    .startingKilometer(startKm)
                    .status(JourneyStatus.IN_PROGRESS)
                    .department(department)
                    .travelers(travelers)
                    .build();
            // update vehicle status
            vehicle.setStatus(VehicleStatus.OCCUPIED);

            Journey savedJourney = journeyRepository.save(journey);
            journeyDTOs.add(convertToDTO(savedJourney));
        }
        

        return journeyDTOs;
    }
    @Override
    @Transactional
    public JourneyDTO endJourney(Long journeyId, Double endingKilometer) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found with id " + journeyId));

        if (journey.getStatus() != JourneyStatus.IN_PROGRESS) {
            throw new IllegalStateException("Journey is not in progress");
        }

        if (endingKilometer <= journey.getStartingKilometer()) {
            throw new IllegalArgumentException("Ending kilometer must be greater than starting kilometer");
        }
        // Update journey
        journey.setEndTime(LocalDateTime.now());
        journey.setEndingKilometer(endingKilometer);
        journey.setDistance(endingKilometer - journey.getStartingKilometer());
        journey.setStatus(JourneyStatus.COMPLETED);
        Journey updatedJourney = journeyRepository.save(journey);
        Request request = journey.getRequest();

        if (request != null) {
            // Check if all journeys for this request are being completed
            List<Journey> requestJourneys = journeyRepository.findAllByRequestId(request.getId());
            boolean allJourneysCompleted = requestJourneys.stream()
                    .allMatch(j -> j.getId().equals(journeyId) || j.getStatus() == JourneyStatus.COMPLETED);
            // ending all merged requests
            List<Request> mergedRequests = request.getMergedRequests();
            for (Request mergedRequest : mergedRequests) {
                List<Journey> mergedJourneys = journeyRepository.findAllByRequestId(mergedRequest.getId());
                boolean allMergedJourneysCompleted = mergedJourneys.stream()
                        .allMatch(j -> j.getStatus() == JourneyStatus.COMPLETED);
    
                if (allMergedJourneysCompleted) {
                    mergedRequest.setStatus(6); // Set to completed
                    mergedRequest.setEndingJourneyTime(LocalDateTime.now());
                    requestRepository.save(mergedRequest);
                }
            }
            // If all journeys are completed, update request status and vehicle statuses
            if (allJourneysCompleted) {
                request.setStatus(6);
                request.setEndingJourneyTime(LocalDateTime.now());
                requestRepository.save(request);
    
                // Update all vehicles to AVAILABLE
                for (Vehicle vehicle : request.getVehicles()) {
                    vehicle.setStatus(VehicleStatus.AVAILABLE);
                    vehicleRepository.save(vehicle);
                }
            }
        }else{
            // update vehicle status to available
            Vehicle vehicle = updatedJourney.getVehicle();
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }

        return convertToDTO(updatedJourney);
    }

    @Override
    public JourneyDTO getJourneyById(Long id) {
        Journey journey = journeyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found with id " + id));
        return convertToDTO(journey);
    }

    @Override
    public List<JourneyDTO> getAllJourneys() {
        List<Journey> journeys = journeyRepository.findAll();
        List<JourneyDTO> journeyDTOs = new ArrayList<>();
        for (Journey journey : journeys) {
            journeyDTOs.add(convertToDTO(journey));
        }
        return journeyDTOs;
    }

    @Override
    public List<JourneyDTO> getJourneysByVehicleId(Long vehicleId) {
        return journeyRepository.findByVehicleId(vehicleId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<JourneyDTO> getJourneysByStatus(JourneyStatus status) {
        return journeyRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JourneyDTO updateJourney(Long id, JourneyDTO journeyDTO) {
        Journey journey = journeyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found with id " + id));

        // Update fields from DTO
        journey.setEndTime(journeyDTO.getEndTime());
        journey.setEndLocation(journeyDTO.getEndLocation());
        journey.setPurpose(journeyDTO.getPurpose());
        journey.setStartingKilometer(journeyDTO.getStartingKilometer());
        journey.setEndingKilometer(journeyDTO.getEndingKilometer());
        journey.setDistance(journeyDTO.getDistance());
        journey.setStatus(journeyDTO.getStatus());

        Journey updatedJourney = journeyRepository.save(journey);
        return convertToDTO(updatedJourney);
    }

    @Override
    @Transactional
    public void deleteJourney(Long id) {
        if (!journeyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Journey not found with id " + id);
        }
        journeyRepository.deleteById(id);
    }

    private JourneyDTO convertToDTO(Journey journey) {
        if (journey == null) {
            return null;
        }
        // Safely handle null travelers list
        List<User> travlers = journey.getTravelers();
        List<UserBriefDTO> travelerDTOs = new ArrayList<>();
        if (travlers != null && !travlers.isEmpty()) {
            for (User user : travlers) {
                travelerDTOs.add(userServiceImpl.mapToUserBriefDTO(user));
            }
        }

        JourneyDTO journeyDTO = new JourneyDTO();
        journeyDTO.setId(journey.getId());
        journeyDTO.setVehicle(vehicleServiceImpl.mapToDTO(journey.getVehicle()));
        journeyDTO.setDriverId(journey.getDriver().getId());
        journeyDTO.setDriver(journey.getDriver() != null ? driverServiceImpl.mapToDTO(journey.getDriver()) : null);
        journeyDTO.setRequestId(journey.getRequest() != null ? journey.getRequest().getId() : null);
        journeyDTO.setStartTime(journey.getStartTime());
        journeyDTO.setEndTime(journey.getEndTime());
        journeyDTO.setEndLocation(journey.getEndLocation());
        journeyDTO.setPurpose(journey.getPurpose());
        journeyDTO.setStartingKilometer(journey.getStartingKilometer());
        journeyDTO.setEndingKilometer(journey.getEndingKilometer());
        journeyDTO.setDistance(journey.getDistance());
        journeyDTO.setStatus(journey.getStatus());
        journeyDTO.setCreatedAt(journey.getCreatedAt());
        journeyDTO.setUpdatedAt(journey.getUpdatedAt());
        journeyDTO.setStatus(journey.getStatus());
        journeyDTO.setRequest(journey.getRequest() != null ? requestServiceImpl.mapToDTO(journey.getRequest()) : null);
        journeyDTO.setTravelers(travelerDTOs);
        journeyDTO.setDepartment(journey.getDepartment() != null ? departmentServiceImpl.mapToDTO(journey.getDepartment()) : null);

        return journeyDTO;
    }



    // @Override
    // public List<JourneyDTO> getJourneysByVehicleId(Long vehicleId) {
    //     // TODO Auto-generated method stub
    //     throw new UnsupportedOperationException("Unimplemented method 'getJourneysByVehicleId'");
    // }
}
