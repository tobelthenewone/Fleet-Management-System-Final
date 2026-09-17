package com.zemenbank.fleetmanagement.model;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "maintenances")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Maintenance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    private String description;

    @Column(nullable = false)
    private Double cost;
    private Double contribution;
    private Double excess;

    // preventive or corrective maintenance
    @Column(nullable = false)
    private String type;
    @ManyToOne
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id")
    Vehicle vehicle;
    


   @OneToOne
@JoinColumn(name = "request_id", referencedColumnName = "id")
private MaintRequest request;
}
