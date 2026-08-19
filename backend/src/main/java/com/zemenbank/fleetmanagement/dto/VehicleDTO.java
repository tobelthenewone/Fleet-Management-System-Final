package com.zemenbank.fleetmanagement.dto;

import java.time.LocalDate;

import com.zemenbank.fleetmanagement.enums.VehicleCategory;
import com.zemenbank.fleetmanagement.enums.VehicleStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) for transferring vehicle information between layers.
 * 
 * Contains vehicle details, driver assignment, status, and maintenance information.
 */
@Data //for getters and setters
@NoArgsConstructor //for no args constructor
@AllArgsConstructor //for all args constructor
@Builder //for builder pattern
public class VehicleDTO {

    /**
     * Unique identifier for the vehicle.
     */
    private Long id;

    /**
     * Plate number of the vehicle.
     */
    private String plateNumber;

    /**
     * Type/category of the vehicle (e.g., sedan, truck).
     */
    private String type;

    /**
     * Model of the vehicle.
     */
    private String model;

    /**
     * Manufacturer of the vehicle.
     */
    private String manufacturer;
    /**
     * Chassis number of the vehicle.
     */
    private String chasseNumber;
    /**
     * Engine number of the vehicle.
     */
    private String engineNumber;

    /**
     * Year the vehicle was made.
     */
    private int yearOfMade;
    /**
     * Engine capacity (cc) of the vehicle.
     */
    private String enginCC;
    /**
     * Date/time when the vehicle was assigned (if applicable).
     */
    private String assignedAt;
    /**
     * Seat capacity of the vehicle.
     */
    private String seatCapa;

    /**
     * Minimum license level required to drive the vehicle.
     */
    private String minLicenseLevel;

    /**
     * Date the vehicle was purchased.
     */
    private LocalDate purchasedDate;
    /**
     * Purchase amount or value of the vehicle.
     */
    private Double vehicleAmount;
    /**
     * Inspection status or details for the vehicle.
     */
    private String inspection;
    
    /**
     * Date of the vehicle's insurance.
     */
    private LocalDate insuranceDate;
    /**
     * Pin code associated with the vehicle (if any).
     */
    private String pincode;
    /**
     * Card number associated with the vehicle (if any).
     */
    private String cardNumber;

    /**
     * URL to the vehicle's image.
     */
    private String imageUrl;

    // Driver information
    /**
     * ID of the assigned driver (if any).
     */
    private Long driverId;
    /**
     * Name of the assigned driver (if any).
     */
    private String driverName;
    /**
     * Phone number of the assigned driver (if any).
     */
    private String driverPhoneNumber;
    /**
     * Current status of the vehicle (enum: AVAILABLE, OCCUPIED, etc.).
     */
    private VehicleStatus status; // ✅ Enum

    // New fields
    /**
     * Current mileage of the vehicle.
     */
    private Double mileage;
    /**
     * Kilometers driven since the last service.
     */
    private Double kilometersSinceLastService;
    /**
     * Indicates if the vehicle had a recent breakdown.
     */
    private Boolean recentBreakdown;
    /**
     * Indicates if the vehicle had maintenance in the last month.
     */
    private Boolean maintenanceLastMonth;

    private VehicleCategory vehicleCategory;


}
