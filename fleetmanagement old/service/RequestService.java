package com.zemenbank.fleetmanagement.service;

import java.util.List;
import java.util.Map;

import com.zemenbank.fleetmanagement.dto.RequestDTO;

public interface RequestService {
    /**
     * Creates a new request.
     * @param request The request data transfer object
     * @return The created request DTO
     */
    RequestDTO createRequest(RequestDTO request);
    /**
     * Retrieves all requests.
     * @return List of all request DTOs
     */
    List<RequestDTO> getAllRequests();
    /**
     * Retrieves a request by its ID.
     * @param id The request ID
     * @return The request DTO
     */
    RequestDTO getRequestById(Long id);
    /**
     * Updates a request.
     * @param id The request ID
     * @param request The updated request DTO
     * @return The updated request DTO
     */
    RequestDTO updateRequest(Long id, RequestDTO request);
    /**
     * Deletes a request by its ID.
     * @param id The request ID
     */
    void deleteRequest(Long id);
    /**
     * Approves a request.
     * @param id The request ID
     * @return The updated request DTO
     */
    RequestDTO approveRequest(Long id);
    /**
     * Rejects a request with a reason.
     * @param id The request ID
     * @param reason The reason for rejection
     * @return The updated request DTO
     */
    RequestDTO rejectRequest(Long id, String reason);
    /**
     * Assigns a vehicle to a request.
     * @param id The request ID
     * @param vehicleId The vehicle ID
     * @return The updated request DTO
     */
    RequestDTO assignVehicleToRequest(Long id,Long vehicleId);
    /**
     * Assigns multiple vehicles to a request.
     * @param id The request ID
     * @param vehicleIds List of vehicle IDs
     * @return The updated request DTO
     */
    RequestDTO assignMultipleVehiclesToRequest(Long id, List<Long> vehicleIds);
    /**
     * Unassigns a vehicle from a request.
     * @param id The request ID
     * @return The updated request DTO
     */
    RequestDTO unassignVehicleFromRequest(Long id);
    /**
     * Retrieves all active requests.
     * @return List of active request DTOs
     */
    List<RequestDTO> getAllActiveRequests();
    /**
     * Retrieves all requests for a user by email.
     * @param email The user's email
     * @return List of user's request DTOs
     */
    List<RequestDTO> getAllOwnRequests(String email);
    /**
     * Retrieves all requests for a department by email.
     * @param email The department head's email
     * @return List of department request DTOs
     */
    List<RequestDTO> getAllDepartmentRequests(String email);
    /**
     * Marks a request as starting a journey.
     * @param id The request ID
     * @param startKilometers The starting kilometers
     * @return The updated request DTO
     */
    // RequestDTO markRequestAsStartingJourney(Long id,Double startKilometers);
    /**
     * Marks a request as ending a journey.
     * @param id The request ID
     * @param endKilometers The ending kilometers
     * @return The updated request DTO
     */
    // RequestDTO markRequestAsEndingJourney(Long id, Double endKilometers);
    /**
     * Retrieves all requests with status 'assigned'.
     * @return List of assigned request DTOs
     */
    List<RequestDTO> getAllAssignedRequests();
    /**
     * Retrieves the number of vehicle assignments by month for the last 6 months.
     * @return Map of month to assignment count
     */
    Map<String, Integer> getVehicleAssignmentsByMonth();
    /**
     * Approves a request by the logistics head.
     * @param id The request ID
     * @return The updated request DTO
     */
    RequestDTO approveByLogisticsHead(Long id);
    // reverse the approval of a pending status request
    /**
     * Reverts a request to pending status.
     * @param id The request ID
     * @return The updated request DTO
     */
    RequestDTO revertToPending(Long id);
    // merge a request with another requests
    /**
     * Merges multiple requests into a base request.
     * @param baseRequestId The base request ID
     * @param mergeRequestIds List of request IDs to merge
     * @return The updated base request DTO
     */
    RequestDTO mergeRequests(Long baseRequestId, List<Long> mergeRequestIds);
    // create pre-approved trip from request
    /**
     * here status should be "pre-approved"
     */
    RequestDTO createPreApprovedTrip(RequestDTO request);
}
