package com.zemenbank.fleetmanagement.model;

import java.time.LocalDateTime;
import java.util.List;

import com.zemenbank.fleetmanagement.enums.TripType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name="requests")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The person who submits the request
    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    // The users who will travel (many users can travel in one request)
    @ManyToMany
    @JoinTable(
        name = "request_travelers",
        joinColumns = @JoinColumn(name = "request_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<User> travelers;

    private String destination;
    private Double latitude;
    private Double longitude;
    private String purpose;

    @Column(nullable = false)
    private String startTime;
    
    private String endTime;

    // 0 = Pending, 1 = Approved by Department Head, 2 = Rejected, 3 = Assigned by Logistics Officer, 
    // 4 = Approved by Logistics Head, 5 = Journey Started, 6 = Journey Ended 7 = merged
    private int status;

    private LocalDateTime startingJourneyTime;
    private LocalDateTime endingJourneyTime;

    private String reasonOfRejection;

    // The department head who approves the request
    @ManyToOne
    @JoinColumn(name = "approver_id")
    private User approver;

    // the department or logistics personel who rejects the request
    @ManyToOne
    @JoinColumn(name = "rejecter_id")
    private User rejecter;

    // The logistics personnel who accepts and assigns the request
    @ManyToOne
    @JoinColumn(name = "accepter_id")
    private User accepter;

    // The vehicles assigned to the request
    @ManyToMany
    @JoinTable(
        name = "request_vehicles",
        joinColumns = @JoinColumn(name = "request_id"),
        inverseJoinColumns = @JoinColumn(name = "vehicle_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Vehicle> vehicles;

    // Keep the single vehicle field for backward compatibility
    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private TripType tripType;

    @Builder.Default
    private String createdAt = LocalDateTime.now().toString();

    /*
     * i want to add fields to track merged requests, optional forign key
     */


    @ManyToOne
    @JoinColumn(name = "base_request_id", nullable = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Request baseRequest;

    @OneToMany(mappedBy = "baseRequest")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Request> mergedRequests;

    // mergedby
    // one user can merge multiple requests
    @ManyToOne
    @JoinColumn(name = "merged_by_id", nullable = true)
    private User mergedBy;

    // department
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Department department;
}
