package com.zemenbank.fleetmanagement.dto;

import com.zemenbank.fleetmanagement.enums.Role;


import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserBriefDTO {
    @Id
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Please provide a valid email")
    @NotBlank(message = "Email is required")
    private String username;
    
 
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotNull(message = "Role is required") 
    private Role role;
    
    private DepartmentDTO department;
}
