package com.zemenbank.fleetmanagement.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zemenbank.fleetmanagement.config.JwtService;
import com.zemenbank.fleetmanagement.dto.AuthenticationResponseDTO;
import com.zemenbank.fleetmanagement.dto.TokenParam;
import com.zemenbank.fleetmanagement.dto.TokenRefreshRequestDTO;
import com.zemenbank.fleetmanagement.dto.TokenResponseDTO;
import com.zemenbank.fleetmanagement.dto.UserLoginDTO;
import com.zemenbank.fleetmanagement.dto.UserRegistrationDTO;
import com.zemenbank.fleetmanagement.model.Token;
import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.repository.TokenRepository;
import com.zemenbank.fleetmanagement.service.AuthenticationService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenRepository tokenRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponseDTO> register(@RequestBody UserRegistrationDTO request) {
        return ResponseEntity.ok(authenticationService.register(request));   

    }
    @PostMapping("auth/login")
    public ResponseEntity<AuthenticationResponseDTO> login(@RequestBody UserLoginDTO request) {
        return ResponseEntity.ok(authenticationService.login(request));   

    }
    @PostMapping("auth/logout")
    public ResponseEntity<?> logout(@RequestBody TokenParam token) {
        authenticationService.logout(token.getToken());
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("auth/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequestDTO request) {
        String refreshToken = request.getRefreshToken();

        try {
            String username = jwtService.extractUsername(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(refreshToken, userDetails)) {
                String newAccessToken = jwtService.generateAccessToken((User) userDetails);
                Token token = Token.builder()
                            .token(newAccessToken)
                            .user((User) userDetails)
                            .build();
                tokenRepository.save(token);
                return ResponseEntity.ok(new TokenResponseDTO(newAccessToken, refreshToken));
            } else {
                // Delete the refresh token from the database if invalid
                tokenRepository.deleteByToken(refreshToken);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
            }
        } catch (Exception e) {
            // Delete the refresh token from the database if expired or invalid
            tokenRepository.deleteByToken(refreshToken);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token expired or invalid");
        }
    }
    @GetMapping("/csrf")
    public CsrfToken csrf(HttpServletRequest request) {
        // Forces Spring Security to generate and return CSRF token
        return (CsrfToken) request.getAttribute("_csrf");
    }
}