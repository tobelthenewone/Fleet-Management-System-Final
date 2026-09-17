package com.zemenbank.fleetmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zemenbank.fleetmanagement.model.Bolo;

@Repository
public interface BoloRepository extends JpaRepository<Bolo, Long> {
    // Custom query methods can be defined here
    List<Bolo> findByVehicleId(Long vehicleId);
}
