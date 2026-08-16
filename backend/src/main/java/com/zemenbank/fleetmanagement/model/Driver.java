package com.zemenbank.fleetmanagement.model;

import java.time.LocalDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Entity representing a driver in the fleet management system.
 * 
 * Stores driver details, license information, occupation status, and relationship to a vehicle.
 */
@Entity
@Table(name = "drivers")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Driver {
    /**
     * Unique identifier for the driver (primary key).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Full name of the driver.
     */
    @Column(nullable = false)
    private String name;

    /**
     * Unique license number for the driver.
     */
    @Column(nullable = false, unique = true)
    private String licenseNumber;

    /**
     * Contact phone number for the driver.
     */
    @Column(nullable = false)
    private String phoneNumber;
    
    /**
     * Unique email address for the driver.
     */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Indicates if the driver is currently assigned to a vehicle or trip.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isOccupied = false;

    /**
     * License level of the driver (default is "1").
     */
    @Column(nullable = true)
    @Builder.Default
    private String licenseLevel = "1";

    /**
     * One-to-one relationship with the assigned vehicle.
     * This is the inverse side of the relationship.
     */
    @OneToOne(mappedBy = "driver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude // to avoid circular reference
    private Vehicle vehicle;

    /**
     * URL to the driver's image or profile picture.
     */
    @Column(nullable = true)
    private String imageUrl;

    /**
     * Timestamp of the last update to the driver's record.
     */
    @Column(nullable = true)
    private LocalDateTime updatedAt;
}
