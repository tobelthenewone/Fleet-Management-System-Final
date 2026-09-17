package com.zemenbank.fleetmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import com.zemenbank.fleetmanagement.enums.RequestStatus;

@Entity
@Table(name = "maintenance_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String maintenanceDetail;
    @Column(nullable = false)
    private String urgencyLevel;

    @Column(nullable = false)
    private String maintenanceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;
    private LocalDate requestedDate;
   @OneToOne(mappedBy = "request")
private Maintenance maintenance;
}
