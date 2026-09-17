package com.zemenbank.fleetmanagement.model;

import com.zemenbank.fleetmanagement.enums.RequestStatus;
import com.zemenbank.fleetmanagement.enums.TirePosition;
import com.zemenbank.fleetmanagement.enums.TireStatus;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "tire_replacement_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TireReplacementRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private LocalDate dateOfRequest;

    // Old Tire Info
    private LocalDate oldTireMountDate;
    private String oldTireBrand;
    private String oldTireSerialNumber;

    @Enumerated(EnumType.STRING)
    private TirePosition tirePosition;

    private int odometerAtMounting;
    private int currentOdometer;

    @Column(columnDefinition = "TEXT")
    private String reasonForReplacement;

    // User making the request
    @ManyToOne
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    // Verification & Approval
    @ManyToOne
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @ManyToOne
    @JoinColumn(name = "rejected_by")
    private User rejectedBy;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDate verifiedDate;
    private LocalDate approvedDate;

    @Enumerated(EnumType.STRING)
    private TireStatus status;
    @OneToOne(mappedBy = "request")
    private TireReplacementLog tireLog;

    public static TireReplacementRequest save(TireReplacementRequest entity) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'save'");
    }

}
