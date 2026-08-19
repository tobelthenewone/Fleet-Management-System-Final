package com.zemenbank.fleetmanagement.repository;

import com.zemenbank.fleetmanagement.model.MaintRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintRequestRepository extends JpaRepository<MaintRequest, Long> {
}
