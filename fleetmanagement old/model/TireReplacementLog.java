package com.zemenbank.fleetmanagement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tire_replacement_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TireReplacementLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateOfReplacement;

    private String newTireBrand;
    private String newTireSerialNumber;
    private LocalDate newTireMountDate;
    private String oldTireBrand;
    private String oldTireSerialNumber;
    private LocalDate oldTireMountDate;
    private int odometerAtReplacement;

    @ManyToOne
    @JoinColumn(name = "replaced_by")
    private User replacedBy;

    @OneToOne
    @JoinColumn(name = "request_id", referencedColumnName = "id")
    private TireReplacementRequest request;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
}
