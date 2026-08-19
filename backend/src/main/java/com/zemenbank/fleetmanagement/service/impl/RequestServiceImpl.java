package com.zemenbank.fleetmanagement.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.dto.RequestBriefDTO;
import com.zemenbank.fleetmanagement.dto.RequestDTO;
import com.zemenbank.fleetmanagement.dto.UserBriefDTO;
import com.zemenbank.fleetmanagement.dto.VehicleDTO;
import com.zemenbank.fleetmanagement.enums.TripType;
import com.zemenbank.fleetmanagement.enums.VehicleStatus;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.Department;
import com.zemenbank.fleetmanagement.model.Driver;
import com.zemenbank.fleetmanagement.model.Request;
import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.model.Vehicle;

// import com.zemenbank.fleetmanagement.repository.JourneyRepository;
import com.zemenbank.fleetmanagement.repository.RequestRepository;
import com.zemenbank.fleetmanagement.repository.UserRepository;
import com.zemenbank.fleetmanagement.repository.VehicleRepository;

import com.zemenbank.fleetmanagement.service.EmailService;
import com.zemenbank.fleetmanagement.service.ExitLetterService;
import com.zemenbank.fleetmanagement.service.RequestService;

import lombok.RequiredArgsConstructor;

/**
 * Service implementation for managing trip and vehicle requests in the fleet
 * management system.
 * 
 * This class provides business logic for:
 * - Creating, updating, and deleting requests
 * - Approving or rejecting requests
 * - Assigning and unassigning vehicles
 * - Marking journey start/end
 * - Fetching requests by various filters (active, department, assigned, etc.)
 * - Mapping between Request and RequestDTO
 */
@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    // private final JourneyRepository journeyRepository;

    private final EmailService emailService;
    private final VehicleRepository vehicleRepository;
    private final ExitLetterService exitLetterService;
    private final VehicleServiceImpl vehicleServiceImpl;
    private final DepartmentServiceImpl departmentServiceImpl;

    /**
     * Creates a new request, sends notification to department head if available.
     * 
     * @param requestdto The request data transfer object
     * @return The created request as a DTO
     */
    @Override
    public RequestDTO createRequest(RequestDTO requestdto) {
        Request request = mapToEntity(requestdto);
        // Save the request
        Request savedRequest = requestRepository.save(request);

        // Get department head if exists
        User departmentHead = savedRequest.getRequester().getDepartment().getManager();

        // Only send email if department head exists
        if (departmentHead != null) {
            System.out.println("Sending email....");
            emailService.sendEmail(
                departmentHead.getUsername() + "@zemenbank.com", 
                "Fleet Request Approval Needed",
                "Dear " + departmentHead.getName() + ",\n\n" +
                "A new fleet request has been submitted and awaits your approval. \n\n" +
                "Please review the request at the following link: " +
                " https://aps2.zemenbank.com/fms/staff/vehicle-request " +
                    "\n\n" +
                "Thank You! \n" +
                "Fleet Management System"
            );
        // if request type is field trip then send email to director
        if (savedRequest.getTripType() == TripType.FIELD_TRIP) {
            User departmentDirector = savedRequest.getRequester().getDepartment().getDirector();
            if (departmentDirector != null) {
                emailService.sendEmail(
                    departmentDirector.getUsername() + "@zemenbank.com",
                    "Fleet Request Approval Needed",
                    "Dear " + departmentDirector.getName() + ",\n\n" +
                    "A new fleet request has been submitted and awaits your approval. \n\n" +
                    "Please review the request at the following link: " +
                    " https://aps2.zemenbank.com/fms/staff/vehicle-request " +
                    "\n\n" +
                    "Thank You! \n" +
                    "Fleet Management System"
                );
            }
        }
        } else {
            // Log a warning that no department head is assigned
            System.out.println("Warning: No department head assigned for department: " +
                    savedRequest.getRequester().getDepartment().getName());
        }

        return mapToDTO(savedRequest);
    }

    /**
     * Retrieves all requests in the system.
     * 
     * @return List of all requests as DTOs
     */
    @Override
    public List<RequestDTO> getAllRequests() {
        List<Request> requests = requestRepository.findAll();
        return requests.stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Retrieves a request by its unique ID.
     * 
     * @param id The request ID
     * @return The request as a DTO
     */
    @Override
    public RequestDTO getRequestById(Long id) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return mapToDTO(request);
    }

    /**
     * Updates an existing request's information.
     * 
     * @param id      The request ID
     * @param request The updated request data
     * @return The updated request as a DTO
     */
    @Override
    public RequestDTO updateRequest(Long id, RequestDTO request) {
        Request existingRequest = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        // Update the existing request with new values
        existingRequest.setDestination(
                !"".equals(request.getDestination()) ? request.getDestination() : existingRequest.getDestination());
        existingRequest
                .setPurpose(!"".equals(request.getPurpose()) ? request.getPurpose() : existingRequest.getPurpose());
        existingRequest.setStartTime(
                !"".equals(request.getStartTime()) ? request.getStartTime() : existingRequest.getStartTime());

        // updating travlers if changed
        if (!request.getTravelerIds().isEmpty()) {
            List<User> travelers = userRepository.findAllById(request.getTravelerIds());
            existingRequest.setTravelers(travelers);
        }

        // Save the updated request
        Request updatedRequest = requestRepository.save(existingRequest);
        return mapToDTO(updatedRequest);
    }

    /**
     * Deletes a request and notifies requester and approver via username.
     * 
     * @param id The request ID
     */
    @Override
    public void deleteRequest(Long id) {
        Request existingRequest = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        requestRepository.delete(existingRequest);
        // Notify the requester via email
        emailService.sendEmail(
                existingRequest.getRequester().getUsername()+"@zemenbank.com", 
                "Fleet Request Deleted",
                "Your fleet request has been deleted.");
        // Notify the approver via username
        emailService.sendEmail(
                existingRequest.getApprover().getUsername()+"@zemenbank.com", 
                "Fleet Request Deleted",
                "A fleet request you were to approve has been deleted.");
    }

    /**
     * Approves a request at the department level and notifies requester.
     * 
     * @param id The request ID
     * @return The updated request as a DTO
     */
    @Override
    public RequestDTO approveRequest(Long id) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Check if the user is authorized to approve the request, i.e if the approvers
        // department is the same as the requesters
        if (!request.getRequester().getDepartment().getId().equals(
                ((User) authentication.getPrincipal()).getDepartment().getId())) {
            throw new RuntimeException("You are not authorized to approve this request");
        }
        request.setStatus(1);
        request.setApprover((User) authentication.getPrincipal());
        Request updatedRequest = requestRepository.save(request);
        // Notify the requester via username
        System.out.println("Authentication Name: " + authentication.getName());
        emailService.sendEmail(
                request.getRequester().getUsername()+"@zemenbank.com", 
                "Fleet Request Approved",
                "Dear " + request.getRequester().getName() +
                        ",\n\nYour fleet request has been approved." +
                        "\n\nThank You! " +
                        "\n Fleet Management System");
        return mapToDTO(updatedRequest);
    }

    /**
     * Rejects a request with a reason and notifies requester and approver.
     * 
     * @param id     The request ID
     * @param reason The reason for rejection
     * @return The updated request as a DTO
     */
    @Override
    public RequestDTO rejectRequest(Long id, String reason) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        Authentication authUser = SecurityContextHolder.getContext().getAuthentication();

        int prevStatus = request.getStatus();
        // Update the status to rejected and set the rejection reason
        request.setStatus(2);
        request.setRejecter((User) authUser.getPrincipal());
        request.setReasonOfRejection(reason);
        Request updatedRequest = requestRepository.save(request);

        // Notify the requester via username
        emailService.sendEmail(
                request.getRequester().getUsername()+"@zemenbank.com", 
                "Fleet Request Rejected",
                "Dear " + request.getRequester().getName() + "," +
                        "\n\nYour fleet request has been rejected." +
                        "\n\nReason: " + reason +
                        "\n\nThank You! " +
                        "\nFleet Management System");
        // Notify the approver via username if the request is made by logistics personnel
        if(prevStatus == 1){
                emailService.sendEmail(request.getApprover().getUsername()+"@zemenbank.com",
                 "Fleet Request Rejected",
                "Dear "+request.getApprover().getName() +","+
                "\n\nFleet request you have been sent recently has been rejected."+
                "\n\nReason: " + reason +
                "\n\nThank You! "+
                "\nFleet Management System"
                );
        }        
        return mapToDTO(updatedRequest);
    }

    /**
     * Assigns a vehicle to a request.
     * 
     * @param id        The request ID
     * @param vehicleId The vehicle ID
     * @return The updated request as a DTO
     */
    @Override
    public RequestDTO assignVehicleToRequest(Long id, Long vehicleId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User assigner = (User) authentication.getPrincipal();
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with this Id:" + id));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with this Id:" + vehicleId));

        // Update vehicle status to OCCUPIED
        vehicle.setStatus(VehicleStatus.OCCUPIED);
        vehicleRepository.save(vehicle);

        // Update the status to assigned
        request.setStatus(3);
        request.setAccepter(assigner);
        request.setVehicle(vehicle);
        Request updatedRequest = requestRepository.save(request);

        // Notify the requester via username
        emailService.sendEmail(
                request.getRequester().getUsername()+"@zemenbank.com", 
                "Fleet Request Assigned",
                "Dear " + request.getRequester().getName() + "," +
                        "\n\nYour fleet request has been assigned a vehicle." +
                        // driver info
                        "\n\n driver: " + vehicle.getDriver().getName() +
                        "\n phone: " + vehicle.getDriver().getPhoneNumber() +
                        "\n vehicle: " + vehicle.getPlateNumber() + " - " + vehicle.getManufacturer() + " " + vehicle.getModel() +
                        "\n\nThank You! " +
                        "\nFleet Management System");
        // Notify the approver via username
        emailService.sendEmail(
                request.getApprover().getUsername()+"@zemenbank.com", 
                "Fleet Request Assigned",
                "Dear " + request.getApprover().getName() + "," +
                        "\n\nFleet request you have been sent recently has been assigned vehicle(s)." +
                        "\n\nThank You! " +
                        "\nFleet Management System");
        // notify driver via email
        emailService.sendEmail(
                vehicle.getDriver().getEmail(),
                "Fleet Assignment",
                "Dear " + vehicle.getDriver().getName() + "," +
                        "\n\nThis is to notify u have been assigned as a driver at " +
                        request.getStartTime() + " towards " + request.getDestination() +
                        "\n\nThank you \nFleet Management");
        // ===== Generate Exit Letter and Send as PDF attachment to driver =====

        byte[] pdfData = exitLetterService.generateExitLetterPdf(
                request.getId().toString(),
                vehicle.getModel(),
                vehicle.getPlateNumber(),
                vehicle.getDriver().getName(),
                request.getRequester().getName(),
                request.getRequester().getDepartment().getName(),
                request.getPurpose(),
                request.getDestination(),
                request.getApprover().getName(),
                request.getAccepter().getName(),
                LocalDate.now().toString());

        emailService.sendEmailWithPdfAttachment(
                vehicle.getDriver().getEmail(),
                "Vehicle Exit Authorization",
                "Please find the attached exit letter authorizing your departure from the park.",
                pdfData,
                "exit_letter.pdf");

        return mapToDTO(updatedRequest);
    }

    /**
     * Assigns multiple vehicles to a request.
     * 
     * @param id         The request ID
     * @param vehicleIds List of vehicle IDs
     * @return The updated request as a DTO
     */
    @Override
    public RequestDTO assignMultipleVehiclesToRequest(Long id, List<Long> vehicleIds) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User assigner = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Update request status and assigner
        request.setStatus(3); // Assigned
        request.setAccepter(assigner);

        // Get all vehicles and update their status
        List<Vehicle> vehicles = vehicleRepository.findAllById(vehicleIds);
        if (vehicles.size() != vehicleIds.size()) {
            throw new RuntimeException("One or more vehicles not found");
        }

        // Update vehicle statuses and add to request
        for (Vehicle vehicle : vehicles) {
            vehicle.setStatus(VehicleStatus.OCCUPIED);
            vehicleRepository.save(vehicle);
        }

        // Clear existing vehicles and add new ones
        if (request.getVehicles() != null) {
            request.getVehicles().clear();
        }
        request.setVehicles(vehicles);

        // For backward compatibility, set the first vehicle as the main vehicle
        if (!vehicles.isEmpty()) {
            request.setVehicle(vehicles.get(0));
        }

        // Save the updated request
        Request savedRequest = requestRepository.save(request);

        // Send username notifications
        String requesterusername = request.getRequester().getUsername() + "@zemenbank.com";
        String approverusername = request.getApprover().getUsername() + "@zemenbank.com";

        // Notify requester
        emailService.sendEmail(
                requesterusername,
                "Vehicle(s) Assigned to Your Request",
                "Your request has been assigned the following vehicle(s):\n" +
                        vehicles.stream()
                                .map(v -> v.getPlateNumber() + " - "  + v.getModel())
                                .collect(Collectors.joining("\n"))
                                // drivers info
                        + "\n\n driver(s): \n" + vehicles.stream()
                                .map(v -> v.getDriver().getName() + " - " + v.getDriver().getPhoneNumber())
                                .collect(Collectors.joining("\n"))

                        + "\n\nThank You! " +
                        "\nFleet Management System"

                                );

        // Notify approver
        emailService.sendEmail(
                approverusername,
                "Vehicle(s) Assigned to Request",
                "The following vehicle(s) have been assigned to request #" + request.getId() + ":\n" +
                        vehicles.stream()
                                .map(v -> v.getPlateNumber() + " - " + v.getManufacturer() + " " + v.getModel())
                                .collect(Collectors.joining("\n"))
                        // drivers info
                        + "\n\n driver(s): \n" + vehicles.stream()
                                .map(v -> v.getDriver().getName() + " - " + v.getDriver().getPhoneNumber())
                                .collect(Collectors.joining("\n")
                                )
                        + "\n\nThank You! " +
                        "\nFleet Management System"
                                );

        // Notify drivers
        for (Vehicle vehicle : vehicles) {
            if (vehicle.getDriver() != null) {
                emailService.sendEmail(
                        vehicle.getDriver().getEmail(),
                        "Vehicle Assignment",
                        "Your vehicle (" + vehicle.getPlateNumber() + ") has been assigned to request #"
                                + request.getId());
            }
        }

        return mapToDTO(savedRequest);
    }

    /**
     * Unassigns a vehicle from a request.
     * 
     * @param id The request ID
     * @return The updated request as a DTO
     */
    @Override
    public RequestDTO unassignVehicleFromRequest(Long id) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with this Id: " + id));

        if (request.getVehicle() == null) {
            throw new IllegalStateException("No vehicle is currently assigned to this request");
        }

        // Store vehicle info for username notification
        Vehicle vehicle = request.getVehicle();
        Driver driver = vehicle.getDriver();

        // Update vehicle status back to AVAILABLE
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);

        // Update request status back to approved (1) and remove vehicle assignment
        request.setStatus(1);
        request.setVehicle(null);
        // make sure to clear the vehicles list if it exists
        request.setVehicles(new ArrayList<>());
        Request updatedRequest = requestRepository.save(request);

        List<Request> mergedRequests = request.getMergedRequests();
        System.out.println("Merged Requests: " + mergedRequests);

        // Notify the requester via username
        emailService.sendEmail(
            request.getRequester().getUsername() + "@zemenbank.com",
            "Vehicle Unassigned from Request",
            "Dear " + request.getRequester().getName() + ",\n\n" +
            "The vehicle has been unassigned from your fleet request.\n\n" +
            " driver: " + (driver != null ? driver.getName() : "Unknown") + "\n" +
            "phone: " + (driver != null ? driver.getPhoneNumber() : "Unknown") + "\n" +
            "vehicle: " + vehicle.getPlateNumber() + " - " + vehicle.getManufacturer() + " " + vehicle.getModel() + "\n\n" +
            "Thank You!\n" +
            "Fleet Management System"
        );
        // username will be broadcasted to all travelers

        // Notify the driver via username
        if (driver != null) {
            emailService.sendEmail(
                    driver.getEmail(),
                    "Vehicle Assignment Cancelled",
                    "Dear " + driver.getName() + ",\n\n" +
                            "Your vehicle assignment for the request to " + request.getDestination() +
                            " has been cancelled.\n\n" +
                            "Thank you\n" +
                            "Fleet Management");
        }

        return mapToDTO(updatedRequest);
    }

    // mapping functions
    /**
     * Maps a RequestDTO to a Request entity.
     * 
     * @param requestdto The request DTO
     * @return The request entity
     */
    private Request mapToEntity(RequestDTO requestdto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<User> travelers = userRepository.findAllById(requestdto.getTravelerIds());
        if (travelers.isEmpty()) {
            travelers = new ArrayList<>();
            travelers.add((User) authentication.getPrincipal());
        }

        return Request.builder()
                .requester((User) authentication.getPrincipal())
                .travelers(travelers)
                .destination(requestdto.getDestination())
                .latitude(requestdto.getLatitude())
                .longitude(requestdto.getLongitude())
                .purpose(requestdto.getPurpose())
                .startTime(requestdto.getStartTime())
                .endTime(requestdto.getEndTime())
                .status(requestdto.getStatus())
                .tripType(requestdto.getTripType())
                .department((Department) ((User)authentication.getPrincipal()).getDepartment())
                .createdAt(new java.util.Date().toString())
                .build();
    }

    /**
     * Maps a Request entity to a RequestDTO.
     * 
     * @param request The request entity
     * @return The request DTO
     */
   RequestDTO mapToDTO(Request request) {
        return RequestDTO.builder()
                .id(request.getId())
                .requesterId(request.getRequester() != null ? request.getRequester().getId() : null)
                .requester(request.getRequester() != null ? mapToUserBriefDTO(request.getRequester()) : null)
                .destination(request.getDestination())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .purpose(request.getPurpose())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(request.getStatus())
                .approverId(request.getApprover() != null ? request.getApprover().getId() : null)
                .approver(request.getApprover() != null ? mapToUserBriefDTO(request.getApprover()) : null)
                .rejecterID(request.getRejecter() != null ? request.getRejecter().getId() : null)
                .rejecter(request.getRejecter() != null ? mapToUserBriefDTO(request.getRejecter()) : null)
                .accepterId(request.getAccepter() != null ? request.getAccepter().getId() : null)
                .assigner(request.getAccepter() != null ? mapToUserBriefDTO(request.getAccepter()) : null)
                .vehicleId(request.getVehicle() != null ? request.getVehicle().getId() : null)
                .tripType(request.getTripType())
                .travelerNames(request.getTravelers() != null
                        ? request.getTravelers().stream().map(User::getName).collect(Collectors.toList())
                        : null)
                .vehicles(request.getVehicles() != null ? request.getVehicles().stream()
                        .map(this::mapToVehicleDTO)
                        .collect(Collectors.toList()) : null)
                .reasonOfRejection(request.getReasonOfRejection())
                .baseRequest(request.getBaseRequest() != null ? mapToDTOO(request.getBaseRequest()) : null)
                .mergedRequests(request.getMergedRequests() != null ? request.getMergedRequests().stream()
                        .map(this::mapToDTOO)
                        .collect(Collectors.toList()) : null)
                .mergedBy(request.getMergedBy() != null ? mapToUserBriefDTO(request.getMergedBy()) : null)
                .department(request.getDepartment() != null ? departmentServiceImpl.mapToDTO(request.getDepartment()) : null)
                .createdAt(request.getCreatedAt())
                .build();
    }

         public RequestBriefDTO mapToDTOO(Request request) {
        if (request == null) return null;

        return RequestBriefDTO.builder()
                .id(request.getId())
                .requesterId(request.getRequester().getId())
                .requester(mapToUserBriefDTO(request.getRequester()))
                .travelerNames(request.getTravelers() != null
                        ? request.getTravelers().stream().map(User::getName).toList()
                        : null)
                .destination(request.getDestination())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .purpose(request.getPurpose())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(request.getStatus())
                .tripType(request.getTripType())
                .approver(mapToUserBriefDTO(request.getApprover()))
                .assigner(mapToUserBriefDTO(request.getAccepter()))
                .rejecter(mapToUserBriefDTO(request.getRejecter()))
                .vehicles(request.getVehicles() != null ? request.getVehicles().stream()
                        .map(vehicleServiceImpl::mapToDTO)
                        .collect(Collectors.toList()) : null)
                .reasonOfRejection(request.getReasonOfRejection())
                .build();
    }

    private VehicleDTO mapToVehicleDTO(Vehicle vehicle) {
        return VehicleDTO.builder()
                .id(vehicle.getId())
                .plateNumber(vehicle.getPlateNumber())
                .type(vehicle.getType())
                .model(vehicle.getModel())
                .manufacturer(vehicle.getManufacturer())
                .chasseNumber(vehicle.getChasseNumber())
                .engineNumber(vehicle.getEngineNumber())
                .yearOfMade(vehicle.getYearOfMade())
                .enginCC(vehicle.getEnginCC())
                .assignedAt(vehicle.getAssignedAt())
                .seatCapa(vehicle.getSeatCapa())
                .minLicenseLevel(vehicle.getMinLicenseLevel())
                .purchasedDate(vehicle.getPurchasedDate())
                .vehicleAmount(vehicle.getVehicleAmount())
                .inspection(vehicle.getInspection())
                .insuranceDate(vehicle.getInsuranceDate())
                .pincode(vehicle.getPincode())
                .cardNumber(vehicle.getCardNumber())
                .driverId(vehicle.getDriver() != null ? vehicle.getDriver().getId() : null)
                .driverName(vehicle.getDriver() != null ? vehicle.getDriver().getName() : null)
                .driverPhoneNumber(vehicle.getDriver() != null ? vehicle.getDriver().getPhoneNumber() : null)
                .status(vehicle.getStatus())
                .build();
    }

    private UserBriefDTO mapToUserBriefDTO(User user) {
        if (user == null)
            return null;

        return UserBriefDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .role(user.getRole())
                .department(departmentServiceImpl.mapToDTO(user.getDepartment()))
                .build();
    }

    /**
     * Retrieves all active (pending/ongoing) requests.
     * 
     * @return List of active requests as DTOs
     */
    @Override
    public List<RequestDTO> getAllActiveRequests() {
        List<Request> requests = requestRepository.findByStatus(0);
        return requests.stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Retrieves all requests made by a specific user.
     * 
     * @param username The user's username
     * @return List of user's requests as DTOs
     */
    @Override
    public List<RequestDTO> getAllOwnRequests(String username) {
        var User = userRepository.findByUsername(username.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this username: " + username));
        List<Request> requests = requestRepository.findByRequester(User);
        return requests.stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Retrieves all requests for a specific department.
     * 
     * @param username The department head's username
     * @return List of department requests as DTOs
     */
    @Override
    public List<RequestDTO> getAllDepartmentRequests(String username) {
        // Fetch the user by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this username: " + username));
        // Get the department ID from the user
        Long departmentId = user.getDepartment().getId();

        List<Request> requests = requestRepository.findByRequesterDepartmentId(departmentId);

        var requestDTOs= new ArrayList<RequestDTO>();
        for (Request request : requests) {
            requestDTOs.add(mapToDTO(request));
        }
        return requestDTOs;

    }

    /**
     * Marks a request as starting a journey, recording the starting kilometers.
     * 
     * @param id              The request ID
     * @param startKilometers The starting kilometers
     * @return The updated request as a DTO
     */
    // @Override
    // public RequestDTO markRequestAsStartingJourney(Long id,Double startKilometers) {
    //     System.out.println("Marking request as starting journey with ID: " + id + " and starting kilometers: " + startKilometers);
    //     Request request = requestRepository.findById(id)
    //             .orElseThrow(() -> new ResourceNotFoundException("Request not found with this Id: " + id));
    //     // Update the status to starting journey
    //     List<Request> mergedRequests = request.getMergedRequests();
    //     System.out.println("MergedRequests: " + mergedRequests);
    //     if (mergedRequests != null && !mergedRequests.isEmpty()) {
    //         // update status of all merged requests to starting journey
    //         for (Request mergedRequest : mergedRequests) {
    //             System.out.println("updating status of merged request: " + mergedRequest.getId());
    //             mergedRequest.setStatus(4); // Starting Journey
    //             mergedRequest.setStartingJourneyTime(LocalDateTime.now());
    //             requestRepository.save(mergedRequest);
    //         }
    //     }
    //     request.setStatus(4);
    //     request.setStartingJourneyTime(LocalDateTime.now());
    //     Request updatedRequest = requestRepository.save(request);

    //     // update the vehicle status to occupied, first fetch the vehicle by its id from request.vehicle
    //     Vehicle vehicle = vehicleRepository.findById(request.getVehicle().getId())
    //             .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with this Id: " + updatedRequest.getVehicle().getId()));
    //     vehicle.setStatus(VehicleStatus.OCCUPIED);
    //     vehicleRepository.save(vehicle);

    //     // create journey
    //     // journeyServiceImpl.createJourney(
    //     //         updatedRequest.getVehicle(),
    //     //         updatedRequest.getStartingJourneyTime().atStartOfDay(),
    //     //         updatedRequest.getRequester().getDepartment().getName(), // Assuming start location is the department name
    //     //         updatedRequest.getDestination(),
    //     //         updatedRequest.getPurpose(),
    //     //         startKilometers,
    //     //         updatedRequest.getId(),
    //     //         updatedRequest.getRequester().getId(),
    //     // );
    //     // Notify the requester via username
    //     emailService.sendEmail(
    //             request.getRequester().getUsername() + "@zemenbank.com",
    //             "Fleet Request Starting Journey",
    //             "Dear " + request.getRequester().getName() + "," +
    //                     "\n\nYour fleet request is now marked as starting journey." +
    //                     "\n\nThank You! " +
    //                     "\nFleet Management System"
    //     );
    //     return mapToDTO(updatedRequest);
    // }
    // /**
    //  * Marks a request as ending a journey, recording the ending kilometers.
    //  * @param id The request ID
    //  * @param endKilometers The ending kilometers
    //  * @return The updated request as a DTO
    //  */
    // @Override
    // public RequestDTO markRequestAsEndingJourney(Long id,Double endKilometers) {
    //     Request request = requestRepository.findById(id)
    //             .orElseThrow(() -> new ResourceNotFoundException("Request not found with this Id: " + id));
    //     // Update the status to ending journey
    //     request.setStatus(5);
    //     request.setEndingJourneyTime(LocalDateTime.now());
    //     Request updatedRequest = requestRepository.save(request);

    //     List<Request> mergedRequests = request.getMergedRequests();
    //     System.out.println("Merged requests: " + mergedRequests);

    //     if (mergedRequests != null && !mergedRequests.isEmpty()) {
    //         // update status of all merged requests to ending journey
    //         for (Request mergedRequest : mergedRequests) {
    //             System.out.println("updating status of merged request: " + mergedRequest.getId());
    //             mergedRequest.setStatus(5); // Ending Journey
    //             mergedRequest.setEndingJourneyTime(LocalDateTime.now());
    //             requestRepository.save(mergedRequest);
    //         }
    //     }

    //     // update journey
    //     /**     
    //      * TODO:
    //      * 1) fetch the journey by request id
    //      * 2) update the journey with the ending journey time
    //      * 3) save the journey
    //      * 
    //      */
    //     Journey journey = journeyRepository.findByRequestId(id);
    //     journey.setEndingKilometer(endKilometers);
    //     journey.setStatus(JourneyStatus.COMPLETED);
    //     journeyRepository.save(journey);

    //     // change vehicle sratus to available, by fwtchinng vehicle by id from request.vehicle
    //     Vehicle vehicle = vehicleRepository.findById(request.getVehicle().getId())
    //             .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with this Id: " + request.getVehicle().getId()));
    //     vehicle.setStatus(VehicleStatus.AVAILABLE);
    //     vehicleRepository.save(vehicle);


    //     // Notify the requester via username
    //     emailService.sendEmail(
    //             request.getRequester().getUsername() + "@zemenbank.com",
    //             "Fleet Request Ending Journey",
    //             "Dear " + request.getRequester().getName() + "," +
    //                     "\n\nYour fleet request is now marked as ending journey." +
    //                     "\n\nThank You! " +
    //                     "\nFleet Management System"
    //     );
    //     return mapToDTO(updatedRequest);
    // }

    /**
     * Retrieves all requests that have been assigned vehicles.
     * 
     * @return List of assigned requests as DTOs
     */
    @Override
    public List<RequestDTO> getAllAssignedRequests() {
        List<Request> requests = requestRepository.findByStatus(3);
        return requests.stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Retrieves the number of vehicle assignments by month for the last 6 months.
     * 
     * @return Map of month to assignment count
     */
    @Override
    public Map<String, Integer> getVehicleAssignmentsByMonth() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(5).withDayOfMonth(1);

        List<Request> requests = requestRepository.findByStatusAndStartingJourneyTimeBetween(3, startDate, endDate);

        Map<String, Integer> monthlyAssignments = new HashMap<>();

        // Initialize all months with 0
        for (int i = 0; i < 6; i++) {
            LocalDate month = endDate.minusMonths(i);
            String monthKey = month.getMonth().toString() + " " + month.getYear();
            monthlyAssignments.put(monthKey, 0);
        }

        // Count assignments for each month
        for (Request request : requests) {
            if (request.getStartingJourneyTime() != null) {
                String monthKey = request.getStartingJourneyTime().getMonth().toString() + " " +
                        request.getStartingJourneyTime().getYear();
                monthlyAssignments.put(monthKey, monthlyAssignments.getOrDefault(monthKey, 0) + 1);
            }
        }

        return monthlyAssignments;
    }

    /**
     * Approves a request by the logistics head.
     * 
     * @param id The request ID
     * @return The updated request as a DTO
     */
    @Override
    public RequestDTO approveByLogisticsHead(Long id) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + id));

        // Check if request is in assigned status (3)
        if (request.getStatus() != 3) {
            throw new RuntimeException("Request must be in assigned status to be approved by logistics head");
        }

        // Update status to approved by logistics head (4)
        request.setStatus(4);
        Request updatedRequest = requestRepository.save(request);

        // Notify the requester via username
        emailService.sendEmail(
                request.getRequester().getUsername() + "@zemenbank.com",
                "Fleet Request Approved by Logistics Head",
                "Dear " + request.getRequester().getName() + "," +
                        "\n\nYour fleet request has been approved by the Logistics Head." +
                        "\n\nThank You! " +
                        "\nFleet Management System");

        // Notify the logistics officer via username
        if (request.getAccepter() != null) {
            emailService.sendEmail(
                    request.getAccepter().getUsername() + "@zemenbank.com",
                    "Fleet Request Approved by Logistics Head",
                    "Dear " + request.getAccepter().getName() + "," +
                            "\n\nYour vehicle assignment has been approved by the Logistics Head." +
                            "\n\nThank You! " +
                            "\nFleet Management System");
        }

        return mapToDTO(updatedRequest);
    }
    /**
     * Reverts a request to pending status.
     * @param id The request ID
     * @return The updated request as a DTO
     */
    @Override
    public RequestDTO revertToPending(Long id) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + id));
        // Check if request is in approved status (1)
        if (request.getStatus() != 1) {
            throw new RuntimeException("Request must be in approved status to be reverted to pending");
        }

        // Update status to pending (0)
        request.setStatus(0);
        Request updatedRequest = requestRepository.save(request);

        // Notify the requester via username
        emailService.sendEmail(
                request.getRequester().getUsername() + "@zemenbank.com",
                "Fleet Request Reverted to Pending",
                "Dear " + request.getRequester().getName() + "," +
                        "\n\nYour fleet request has been reverted to pending status." +
                        "\n\nThank You! " +
                        "\nFleet Management System");

        return mapToDTO(updatedRequest);
    }
    /**
     * Merges multiple requests into a base request.
     * @param baseRequestId The base request ID
     * @param mergeRequestIds List of request IDs to merge
     * @return The updated base request as a DTO
     */
    @Override
    public RequestDTO mergeRequests(Long baseRequestId, List<Long> mergeRequestIds) {
        Request baseRequest = requestRepository.findById(baseRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Base request not found with id: " + baseRequestId));
        List<Request> mergeRequests = requestRepository.findAllById(mergeRequestIds);
        // Validate and merge requests
        for (Request mergeRequest : mergeRequests) {
            if (mergeRequest.getStatus() != 1) {
                throw new RuntimeException("All requests must be in approved status to be merged");
            }
            // Merge logic (e.g., combine details, update status)
        }

        // Set the base request as the parent for merged requests
        for (Request mergeRequest : mergeRequests) {
            mergeRequest.setBaseRequest(baseRequest);
            // set status to merged (7)
            mergeRequest.setStatus(7);
            mergeRequest.setMergedBy((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());

            requestRepository.save(mergeRequest);
        }
        // Save and return the updated base request
        return mapToDTO(requestRepository.save(baseRequest));
    }

    @Override
    public RequestDTO createPreApprovedTrip(RequestDTO request) {
        /**
         * here status of the request is set to as approved to logistics head (4)
         * created at is set to current date and time
         * the requester is set to the current user
         * 
         */
        Request savedRequest = requestRepository.save( mapToPreApprovedEntity(request));
        // Notify the requester via username
        return mapToDTO(savedRequest);
    }


private Request mapToPreApprovedEntity(RequestDTO requestdto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // List<User> travelers = userRepository.findAllById(requestdto.getTravelerIds());
        // if (travelers.isEmpty()) {
        //     travelers = new ArrayList<>();
        //     travelers.add((User) authentication.getPrincipal());
        // }
        // Vehicles will be fetched by their plate numbers

        return Request.builder()
                .requester((User) authentication.getPrincipal())
                .travelers( new ArrayList<>())
                .destination("Pre-Approved Trip")
                // .latitude(requestdto.getLatitude())
                // .longitude(requestdto.getLongitude())
                .purpose("pre-approved trip")
                // .startTime(requestdto.getStartTime())
                // .endTime(requestdto.getEndTime())
                .status(4) // Approved by logistics head
                .tripType(TripType.NIGHT_SHIFT) // Assuming default trip type for pre-approved trips
                .build();
    }
}
