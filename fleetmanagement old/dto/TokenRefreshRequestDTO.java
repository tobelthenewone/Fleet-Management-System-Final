package com.zemenbank.fleetmanagement.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TokenRefreshRequestDTO {
    private String refreshToken;
    
}
