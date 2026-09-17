package com.zemenbank.fleetmanagement.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.zemenbank.fleetmanagement.enums.DepartmentLocation;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a department in the fleet management system.
 * 
 * Stores department details, description, and the relationship to the department head (User).
 */
@Data
@Entity
@Table(name = "departments")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Department{
    /**
     * Unique identifier for the department (primary key).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Name of the department (must be unique).
     */
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    // Location of the department (either in Addis Ababa or an outlet)
    private DepartmentLocation location;

    /**
     * Optional description of the department.
     */
    @Column(name = "description")
    private String description;

    /**
     * One-to-one relationship with the department head (User).
     * The department head is a user who leads the department.
     */
    @OneToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "manager_username", referencedColumnName = "username")
    @JsonManagedReference
    private User manager;

    /**
     * Many-to-one relationship with the director (User).
     * A director can oversee multiple departments, but a department has only one director.
     */
    @ManyToOne
    @JoinColumn(name = "director_username", referencedColumnName = "username")
    private User director;

}