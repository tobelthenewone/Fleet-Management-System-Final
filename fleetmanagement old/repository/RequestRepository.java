package com.zemenbank.fleetmanagement.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zemenbank.fleetmanagement.model.Request;
import com.zemenbank.fleetmanagement.model.User;

/**
 * Repository interface for accessing request records in the database.
 * 
 * Extends JpaRepository to provide CRUD operations for Request entities.
 * Includes custom methods for finding requests by status, requester, approver, department, and date range.
 */
@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    /**
     * Finds all requests with a specific status.
     * @param status The request status
     * @return List of requests with the given status
     */
    List<Request> findByStatus(int status);
    /**
     * Finds all requests made by a specific requester.
     * @param requester The user who made the request
     * @return List of requests by the requester
     */
    List<Request> findByRequester(User requester);
    /**
     * Finds all requests approved by a specific approver.
     * @param approver The user who approved the request
     * @return List of requests approved by the approver
     */
    List<Request> findByApprover(User approver);
    /**
     * Finds all requests for a specific department.
     * @param departmentId The department's unique identifier
     * @return List of requests for the department
     */
    List<Request> findByRequesterDepartmentId(Long departmentId);
    /**
     * Finds all requests with a specific status and starting journey time within a date range.
     * @param status The request status
     * @param startDate The start date
     * @param endDate The end date
     * @return List of requests matching the criteria
     */
    List<Request> findByStatusAndStartingJourneyTimeBetween(int status, LocalDate startDate, LocalDate endDate);
}
