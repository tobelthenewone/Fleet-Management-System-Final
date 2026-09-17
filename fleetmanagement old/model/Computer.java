package com.zemenbank.fleetmanagement.model;

import java.time.LocalDateTime;

import com.zemenbank.fleetmanagement.enums.OwnershipType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "computers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Computer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false, unique = true)
    private String serialNumber;

    @Column(nullable = false)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OwnershipType ownershipType;

    @Column(unique = true)
    private String qrCode; // path or identifier

}
