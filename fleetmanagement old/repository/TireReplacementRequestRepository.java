// TireReplacementRequestRepository.java
package com.zemenbank.fleetmanagement.repository;

import com.zemenbank.fleetmanagement.model.TireReplacementRequest;
import com.zemenbank.fleetmanagement.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TireReplacementRequestRepository extends JpaRepository<TireReplacementRequest, Long> {
    List<TireReplacementRequest> findByStatus(RequestStatus status);
}
