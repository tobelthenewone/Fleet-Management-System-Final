package com.zemenbank.fleetmanagement.service.impl;

import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.config.JwtService;
import com.zemenbank.fleetmanagement.dto.AuthenticationResponseDTO;
import com.zemenbank.fleetmanagement.dto.UserLoginDTO;
import com.zemenbank.fleetmanagement.dto.UserRegistrationDTO;
import com.zemenbank.fleetmanagement.enums.Role;
import com.zemenbank.fleetmanagement.exception.InvalidCredentialsException;
import com.zemenbank.fleetmanagement.exception.UserAlreadyExistsException;
import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.repository.DepartmentRepository;
import com.zemenbank.fleetmanagement.repository.TokenRepository;
import com.zemenbank.fleetmanagement.repository.UserRepository;
import com.zemenbank.fleetmanagement.service.AuthenticationService;

import jakarta.transaction.Transactional;

import com.zemenbank.fleetmanagement.model.Token;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final DepartmentRepository departmentRepository;
    private final TokenRepository tokenRepository;

    @Override
    public AuthenticationResponseDTO register(UserRegistrationDTO request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("User already exists in local DB.");
        }
        var department = departmentRepository.findById(request.getDepartmentId())
        .orElseThrow(() -> new UserAlreadyExistsException("Department not found"));



        var user = User.builder()
                    .name(request.getName())
                    .username(request.getUsername())  
                    .department(department)
                    .role(request.getRole() != null ? request.getRole() : Role.EMPLOYEE)
                    .build();
        userRepository.save(user);
        return AuthenticationResponseDTO.builder()
                .role(user.getRole().name())
                .name(user.getName())
                .username(user.getUsername()) // include username in response
                .build();


    }
    @Override
    public AuthenticationResponseDTO login(UserLoginDTO request) {
        try {
            // // Authenticate username/password using Spring AuthenticationManager
            // authenticationManager.authenticate(
            //     new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            // );

            // If authentication succeeds, load the user and issue tokens
            var user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new InvalidCredentialsException("User not found in local DB."));

            Map<String, Object> claims = Map.of("role", user.getRole().name());
            String accessToken = jwtService.generateAccessToken(claims, user);
            Token token = Token.builder()
                        .token(accessToken)
                        .user(user)
                        .build();
            tokenRepository.save(token);
            String refreshToken = jwtService.generateRefreshToken(user);

            var role = jwtService.extractRole(accessToken);

            return AuthenticationResponseDTO.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .role(role)
                    .username(user.getUsername())
                    .name(user.getName())
                    .build();
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            // Translate Spring security exception to application-specific exception
            throw new InvalidCredentialsException("Invalid username or password");
        } catch (Exception e) {
            System.out.println(e.getMessage()+e.getStackTrace());
            throw e;
        }

    }
    @Override
    @Transactional
    public void logout(String token) {
        tokenRepository.deleteByToken(token);
        System.out.println("User logged out successfully.");
    }
    
    
}
