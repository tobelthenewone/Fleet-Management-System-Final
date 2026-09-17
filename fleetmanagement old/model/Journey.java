package com.zemenbank.fleetmanagement.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.zemenbank.fleetmanagement.enums.JourneyStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

    @Entity
    @Table(name = "journey_logs")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Journey {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.EAGER)
        @JoinColumn(name = "vehicle_id", nullable = false)
        private Vehicle vehicle;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "driver_id", nullable = false)
        private Driver driver;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "request_id", nullable = true)
        @ToString.Exclude
        @EqualsAndHashCode.Exclude
        private Request request;

        @Column(name = "start_time", nullable = false)
        private LocalDateTime startTime;

        @Column(name = "end_time")
        private LocalDateTime endTime;

        @Column(name = "end_location", nullable = false)
        private String endLocation;

        @Column(name = "purpose", nullable = false)
        private String purpose;

        @Column(name = "starting_kilometer", nullable = false)
        private Double startingKilometer;

        @Column(name = "ending_kilometer")
        private Double endingKilometer;

        @Column(name = "distance")
        private Double distance;

        //department
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "department_id", nullable = true)
        @ToString.Exclude
        @EqualsAndHashCode.Exclude
        private Department department;

        // travelers
        // fetch = FetchType.LAZY
        @ManyToMany()
        @JoinTable(name = "journey_travelers",
                joinColumns = @JoinColumn(name = "journey_id"),
                inverseJoinColumns = @JoinColumn(name = "traveler_id"))
        @ToString.Exclude
        @EqualsAndHashCode.Exclude
        private List<User> travelers = new ArrayList<>();

        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false)
        @Builder.Default
        private JourneyStatus status = JourneyStatus.IN_PROGRESS;

        @Column(name = "created_at", nullable = false, updatable = false)
        private LocalDateTime createdAt;

        @Column(name = "updated_at")
        private LocalDateTime updatedAt;
    
        

        @PrePersist
        protected void onCreate() {
            this.createdAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
        }

        @PreUpdate
        protected void onUpdate() {
            this.updatedAt = LocalDateTime.now();
        }
    }
