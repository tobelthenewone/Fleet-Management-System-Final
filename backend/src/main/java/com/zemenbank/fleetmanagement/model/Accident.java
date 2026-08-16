package com.zemenbank.fleetmanagement.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing an accident record in the fleet management system.
 * 
 * Stores accident details, claim and report statuses, timestamps for various stages,
 * and the relationship to the associated vehicle.
 */
@Entity
@Table(name = "accidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Accident {
    /**
     * Unique identifier for the accident (primary key).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Date when the accident occurred.
     */
    @Column(nullable = false)
    private LocalDate accidentDate;

    /**
     * Description of fault or party at fault for the accident.
     */
    @Column(nullable = false)
    private String fault;

    /**
     * Status or details of the insurance claim related to the accident.
     */
    @Column(nullable = true)
    private String insuranceClaim;

    /**
     * Status or details of the police report related to the accident.
     */
    @Column(nullable = true)
    private String policeReport;

    /**
     * Additional remarks or notes about the accident.
     */
    private String remark;

    /**
     * Timestamp when the insurance claim was made (nullable).
     */
    @Column(nullable = true)
    private LocalDateTime insuranceClaimedAt;

    /**
     * Timestamp when the police report was filed (nullable).
     */
    @Column(nullable = true)
    private LocalDateTime policeReportedAt;

    /**
     * Timestamp when the insurance survey was conducted (nullable).
     */
    @Column(nullable = true)
    private LocalDateTime insuranceSurveyedAt;

    /**
     * Timestamp when the vehicle was repaired after the accident (nullable).
     */
    @Column(nullable = true)
    private LocalDateTime repairedAt;

    /**
     * Timestamp when the vehicle was released after the accident (nullable).
     */
    @Column(nullable = true)
    private LocalDateTime releasedAt;

    /**
     * Many-to-one relationship to the vehicle involved in the accident.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @ToString.Exclude
    private Vehicle vehicle;
}
