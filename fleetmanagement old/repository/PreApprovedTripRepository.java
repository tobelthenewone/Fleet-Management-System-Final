package com.zemenbank.fleetmanagement.repository;
import com.zemenbank.fleetmanagement.model.PreApprovedTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PreApprovedTripRepository extends JpaRepository<PreApprovedTrip, Long> {

}
    