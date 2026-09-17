package com.zemenbank.fleetmanagement.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zemenbank.fleetmanagement.dto.RequestDTO;
import com.zemenbank.fleetmanagement.dto.UserDTO;
import com.zemenbank.fleetmanagement.service.RequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller for managing trip and vehicle requests in the fleet management system.
 * 
 * This controller provides endpoints for:
 * - Creating, updating, and deleting requests
 * - Approving or rejecting requests
 * - Assigning and unassigning vehicles
 * - Marking journey start/end
 * - Fetching requests by various filters (active, department, assigned, etc.)
 * 
 * All endpoints are prefixed with "/api/v1/requests" and follow RESTful conventions.
 */
class KilometerInput {
    private Double kilometers;

    public Double getKilometers() {
        return kilometers;
    }

    public void setKilometers(Double kilometers) {
        this.kilometers = kilometers;
    }
}

// Add new class for rejection input
class RejectionInput {
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class RequestController {
    private final RequestService requestService;

    /**
     * Creates a new trip or vehicle request.
     * @param requestdto The request data transfer object
     * @return The created request
     */
    @PostMapping
    public ResponseEntity<RequestDTO> createRequest(@RequestBody RequestDTO requestdto) {
        System.out.println("Request DTO at controller: " + requestdto);
        return ResponseEntity.ok(requestService.createRequest(requestdto));
    }

    /**
     * Retrieves all requests in the system.
     * @return List of all requests
     */
    @GetMapping
    public ResponseEntity<List<RequestDTO>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    /**
     * Retrieves all active (pending/ongoing) requests.
     * @return List of active requests
     */
    @GetMapping("/active")
    public ResponseEntity<List<RequestDTO>> getAllActiveRequests() {
        return ResponseEntity.ok(requestService.getAllActiveRequests());
    }

    /**
     * Retrieves a request by its unique ID.
     * @param id The request ID
     * @return The request details
     */
    @GetMapping("/{id}")
    public ResponseEntity<RequestDTO> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getRequestById(id));
    }

    /**
     * Approves a request at the department level.
     * @param id The request ID
     * @return The updated request
     */
    @GetMapping("/{id}/department/approve")
    public ResponseEntity<RequestDTO> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.approveRequest(id));
    }

    /**
     * Rejects a request with a reason.
     * @param id The request ID
     * @param input The rejection reason
     * @return The updated request
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<RequestDTO> rejectRequest(@PathVariable Long id, @RequestBody RejectionInput input) {
        return ResponseEntity.ok(requestService.rejectRequest(id, input.getReason()));
    }

    /**
     * Approves a request by the logistics head.
     * @param id The request ID
     * @return The updated request
     */
    @GetMapping("/{id}/logistics-head/approve")
    public ResponseEntity<RequestDTO> approveByLogisticsHead(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.approveByLogisticsHead(id));
    }

    /**
     * Assigns a vehicle to a request.
     * @param id The request ID
     * @param assignerId The user assigning the vehicle
     * @param vehicleId The vehicle to assign
     * @return The updated request
     */
    @GetMapping("/{id}/logistics/assign/{assignerId}/{vehicleId}")
    public ResponseEntity<RequestDTO> assignVehicle(@PathVariable Long id, @PathVariable Long assignerId,
            @PathVariable Long vehicleId) {
        return ResponseEntity.ok(requestService.assignVehicleToRequest(id, vehicleId));
    }

    /**
     * Assigns multiple vehicles to a request.
     * @param id The request ID
     * @param vehicleIds List of vehicle IDs
     * @return The updated request
     */
    @PostMapping("/{id}/logistics/assign-multiple")
    public ResponseEntity<RequestDTO> assignMultipleVehicles(
            @PathVariable Long id,
            @RequestBody List<Long> vehicleIds) {
        return ResponseEntity.ok(requestService.assignMultipleVehiclesToRequest(id, vehicleIds));
    }

    /**
     * Unassigns a vehicle from a request.
     * @param id The request ID
     * @return The updated request
     */
    @GetMapping("/{id}/logistics/unassign")
    public ResponseEntity<RequestDTO> unassignVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.unassignVehicleFromRequest(id));
    }

    /**
     * Updates an existing request.
     * @param id The request ID
     * @param requestdto The updated request data
     * @return The updated request
     */
    @PutMapping("/{id}")
    public ResponseEntity<RequestDTO> updateRequest(@PathVariable Long id, @Valid @RequestBody RequestDTO requestdto) {
        return ResponseEntity.ok(requestService.updateRequest(id, requestdto));
    }

    /**
     * Deletes a request by its ID.
     * @param id The request ID
     * @return No content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        requestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves all requests made by a specific user.
     * @param dto The user data transfer object (email)
     * @return List of user's requests
     */
    @PostMapping("/own")
    public ResponseEntity<List<RequestDTO>> getAllOwnRequests(@RequestBody UserDTO dto) {
        return ResponseEntity.ok(requestService.getAllOwnRequests(dto.getUsername()));
    }

    /**
     * Retrieves all requests for a specific department.
     * @param email The department head's email
     * @return List of department requests
     */
    @GetMapping("/department/{username}")
    public ResponseEntity<List<RequestDTO>> getAllDepartmentRequests(@PathVariable String username) {
        return ResponseEntity.ok(requestService.getAllDepartmentRequests(username));
    }

    /**
     * Marks a request as starting a journey, recording the starting kilometers.
     * @param id The request ID
     * @param kilometerInput The starting kilometers
     * @return The updated request
     */
    // @PostMapping("/{id}/JOURNEY_CONTROLLER/start-journey")
    // public ResponseEntity<RequestDTO> markRequestAsStartingJourney(@PathVariable Long id,
    //         @RequestBody KilometerInput kilometerInput) {
    //     return ResponseEntity.ok(requestService.markRequestAsStartingJourney(id, kilometerInput.getKilometers()));
    // }

    /**
     * Marks a request as ending a journey, recording the ending kilometers.
     * @param id The request ID
     * @param kilometerInput The ending kilometers
     * @return The updated request
     */
    // @PostMapping("/{id}/JOURNEY_CONTROLLER/end-journey")
    // public ResponseEntity<RequestDTO> markRequestAsEndingJourney(@PathVariable Long id,
    //         @RequestBody KilometerInput kilometerInput) {
    //     return ResponseEntity.ok(requestService.markRequestAsEndingJourney(id, kilometerInput.getKilometers()));
    // }

    /**
     * Retrieves all requests that have been assigned vehicles.
     * @return List of assigned requests
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<RequestDTO>> getAllAssignedRequests() {
        return ResponseEntity.ok(requestService.getAllAssignedRequests());
    }

    /**
     * Retrieves the number of vehicle assignments by month for the last 6 months.
     * @return Map of month to assignment count
     */
    @GetMapping("/assignments/monthly")
    public ResponseEntity<Map<String, Integer>> getVehicleAssignmentsByMonth() {
        return ResponseEntity.ok(requestService.getVehicleAssignmentsByMonth());
    }

    // revert-to-pending
    /**
     * Reverts a request to pending status.
     * @param id The request ID
     * @return The updated request
     */
    @GetMapping("/{id}/revert-to-pending")
    public ResponseEntity<RequestDTO> revertToPending(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.revertToPending(id));
    }

    /**
     * Merges multiple requests into a base request.
     * @param baseRequestId The base request ID
     * @param mergeRequestIds List of request IDs to merge
     * @return The updated base request
     */
    @PostMapping("/{baseRequestId}/merge")
    public ResponseEntity<RequestDTO> mergeRequests(
            @PathVariable Long baseRequestId,
            @RequestBody List<Long> mergeRequestIds) {
        return ResponseEntity.ok(requestService.mergeRequests(baseRequestId, mergeRequestIds));
    }

    // create pre-approved trip from request
    /**
     * Creates a pre-approved trip from a request.
     * @param request The request data transfer object
     * @return The created pre-approved trip
     */
    @PostMapping("/pre-approved")
    public ResponseEntity<RequestDTO> createPreApprovedTrip(@RequestBody RequestDTO request) {
        return ResponseEntity.ok(requestService.createPreApprovedTrip(request));
    }
}
