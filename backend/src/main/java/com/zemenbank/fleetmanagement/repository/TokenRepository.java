package com.zemenbank.fleetmanagement.repository;


import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.zemenbank.fleetmanagement.model.Token;

public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByToken(String token);
    void deleteByToken(String token);
}