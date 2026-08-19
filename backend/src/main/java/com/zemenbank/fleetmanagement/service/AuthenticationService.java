package com.zemenbank.fleetmanagement.service;

import com.zemenbank.fleetmanagement.dto.AuthenticationResponseDTO;
import com.zemenbank.fleetmanagement.dto.UserLoginDTO;
import com.zemenbank.fleetmanagement.dto.UserRegistrationDTO;

public interface AuthenticationService {
    public AuthenticationResponseDTO register(UserRegistrationDTO request);
    public AuthenticationResponseDTO login(UserLoginDTO request);
    public void logout(String token);
}
