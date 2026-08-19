package com.zemenbank.fleetmanagement.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Tyre {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    // many to one relationship with vehicle
    @ManyToOne
    private Vehicle vehicle;
    private String tyrePosition;
    private Long odometer;
    private String removedTyreBrand;
    private String removedTireSerialNumber;
    private String newTireBrand;
    private String newTireSerialNumber;
    private String fittedBy;
    private String notes;
    private LocalDate date;
    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();

}
