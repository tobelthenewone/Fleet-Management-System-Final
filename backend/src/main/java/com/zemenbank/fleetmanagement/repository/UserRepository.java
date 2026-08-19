package com.zemenbank.fleetmanagement.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zemenbank.fleetmanagement.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String email); 
    List<User> findByDepartmentId(Long departmentId);
    List<User> findAllByIdIn(List<Long> userIds);
}
