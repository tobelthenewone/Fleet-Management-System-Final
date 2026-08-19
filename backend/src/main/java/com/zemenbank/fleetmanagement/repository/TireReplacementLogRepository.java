// TireReplacementLogRepository.java
package com.zemenbank.fleetmanagement.repository;

import com.zemenbank.fleetmanagement.model.TireReplacementLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TireReplacementLogRepository extends JpaRepository<TireReplacementLog, Long> {
    Optional<TireReplacementLog> findByRequestId(Long requestId);
}
