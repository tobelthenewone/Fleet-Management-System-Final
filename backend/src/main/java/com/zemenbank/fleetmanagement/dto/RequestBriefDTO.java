package com.zemenbank.fleetmanagement.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.*;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RequestBriefDTO {
        private Long id;
    /**
     * ID of the user who made the request.
     */
    private Long requesterId;
    /**
     * Brief information about the requester.
     */
    private UserBriefDTO requester;
    /**
     * Array of brief information about travelers.
     */
    private UserBriefDTO[] travlers;
    /**
     * List of traveler names.
     */
    private List<String> travelerNames;
    /**
     * List of traveler IDs.
     */
    private List<Long> travelerIds;
    /**
     * Destination for the trip.
     */
    @NotBlank(message = "Destination cannot be blank")
    private String destination;
    /**
     * Latitude of the destination (if applicable).
     */
    private Double latitude;
    /**
     * Longitude of the destination (if applicable).
     */
    private Double longitude;
    /**
     * Purpose of the trip.
     */
    private String purpose;
    /**
     * Start time of the trip.
     */
    @NotBlank(message = "Start time cannot be blank")
    private String startTime;
    /**
     * End time of the trip (if applicable).
     */
    private String endTime;
    /**
     * Status of the request (integer code).
     */
    private int status;
    /**
     * ID of the user who approved the request.
     */
    private Long approverId;
    /**
     * Brief information about the approver.
     */
    private UserBriefDTO approver;
    /**
     * ID of the user who rejected the request.
     */
    private Long rejecterID;
    /**
     * Brief information about the rejecter.
     */
    private UserBriefDTO rejecter;
    /**
     * ID of the user who accepted the request.
     */
    private Long accepterId;
    /**
     * Brief information about the assigner (who assigned the vehicle).
     */
    private UserBriefDTO assigner;
    /**
     * ID of the assigned vehicle (if any).
     */
    private Long vehicleId;
    /**
     * Information about the assigned vehicle (if any).
     */
    private VehicleDTO vehicle;
    /**
     * List of assigned vehicles (for multi-vehicle requests).
     */
    private List<VehicleDTO> vehicles;
    /**
     * Reason for rejection (if applicable).
     */
    private String reasonOfRejection;
    /**
     * Type of trip (enum: TripType).
     */
    private com.zemenbank.fleetmanagement.enums.TripType tripType;
}
