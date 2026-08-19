package com.zemenbank.fleetmanagement.model;

import java.time.LocalDate;
import java.util.List;

import com.zemenbank.fleetmanagement.enums.VehicleCategory;
import com.zemenbank.fleetmanagement.enums.VehicleStatus;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity //
@Table(name = "vehicles")
@Data //for getters and setters
@NoArgsConstructor //for no args constructor
@AllArgsConstructor //for all args constructor
@Builder //for builder pattern
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String plateNumber;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String model;

    private String manufacturer;

    private String chasseNumber;

    private String engineNumber;

    @Min(1900)
    private int yearOfMade;
   

    private String enginCC;

    private String assignedAt;

    private String seatCapa;

    @Builder.Default
    private String minLicenseLevel = "1";

    private LocalDate purchasedDate;

    // Red flag, require to know what  it is?.
    private Double vehicleAmount;

    private String inspection;

    private LocalDate insuranceDate;

    private String pincode;

    private String cardNumber;

    @Column(nullable = true)
    private Double mileage;

    @Column(nullable = true)
    private Double kilometersSinceLastService;

    @Column(nullable = true)
    @Builder.Default
    private Boolean recentBreakdown = false;

    @Builder.Default
    private Boolean maintenanceLastMonth = false;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Accident> accidents;


    @OneToOne(mappedBy = "vehicle") // InsurancePolicy owns the relation
    private InsurancePolicy insurancePolicy;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "driver_id", referencedColumnName = "id")
    @ToString.Exclude 
    private Driver driver;

    @ManyToMany(mappedBy = "vehicles")
    private List<Request> requests;
    // one-to-many relationship with Maintenance
    /**
     * mappedBy = "vehicle" means:
     *      - The vehicle field inside the Maintenance entity owns the relationship.
     */
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude // without this,calling toString() on Vehicle will also call toString() on Maintenance, which again calls toString() on Vehicle, and so on → causes a StackOverflowError
    private List<Maintenance> maintenancesRecords;


  @Enumerated(EnumType.STRING)
  @Column(name = "status")
  @Builder.Default
  private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Column(nullable = true)
    private String imageUrl;

  @Builder.Default
    private VehicleCategory vehicleCategory= VehicleCategory.GENERAL;

  @ManyToOne
  @JoinColumn(name = "pre_approved_trip_id")
  private PreApprovedTrip preApprovedTrip;
     
}


/*
 * cascade = CascadeType.ALL 
 *      This means: When you do operations (like save(), delete(), etc.) on a Vehicle, those changes will be cascaded to all related Maintenance records.
 */