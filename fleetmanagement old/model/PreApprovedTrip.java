package com.zemenbank.fleetmanagement.model;

import java.util.List;

import com.zemenbank.fleetmanagement.enums.AssignmentType;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.*;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PreApprovedTrip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // relationships with Department and Vehicle
    @ManyToOne(optional = true)
    @JoinColumn(name = "department_id")
    private Department department;
    @OneToMany
    @JoinColumn(name = "pre_approved_trip_id")
    private List<Vehicle> vehicles;
    private AssignmentType assignmentType;
}
