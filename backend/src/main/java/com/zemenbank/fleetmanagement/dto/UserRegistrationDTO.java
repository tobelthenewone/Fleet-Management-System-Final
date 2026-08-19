package com.zemenbank.fleetmanagement.dto;


import com.zemenbank.fleetmanagement.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {
    private String name;
    private String username;
    private String email;
    private String password;
    private String phoneNumber;
    private Role role; 
    private Long departmentId;
}