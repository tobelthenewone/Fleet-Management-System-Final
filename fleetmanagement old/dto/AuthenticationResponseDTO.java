package com.zemenbank.fleetmanagement.dto;



import lombok.*;

/**
 * Data Transfer Object (DTO) for sending authentication response data to the client.
 * 
 * Contains access and refresh tokens, user role, name, and email.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthenticationResponseDTO {
    /**
     * JWT access token for authenticated requests.
     */
    private String accessToken;
    /**
     * JWT refresh token for obtaining new access tokens.
     */
    private String refreshToken;
    /**
     * Role of the authenticated user.
     */
    private String role;
    /**
     * Name of the authenticated user.
     */
    private String name;
    /**
     * Email of the authenticated user.
     */
    private String username;

}
