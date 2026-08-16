package com.zemenbank.fleetmanagement.config;


import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.repository.TokenRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;

/**
 * Service for handling JWT (JSON Web Token) operations such as generation, validation, and claim extraction.
 * 
 * Provides methods to generate access and refresh tokens, extract claims, validate tokens, and retrieve user roles.
 */
@Service
@RequiredArgsConstructor
public class JwtService {
    private final TokenRepository tokenRepository;
    /**
     * Secret key for signing JWT tokens, loaded from application properties.
     */
    @Value("${jwt.SECRET_KEY}")
    private String SECRET_KEY;

    /**
     * Extracts the username (subject) from a JWT token.
     * @param token the JWT token
     * @return the username (subject)
     */
    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }
    /**
     * Extracts a specific claim from a JWT token using a resolver function.
     * @param token the JWT token
     * @param claimsResolver function to resolve the claim
     * @param <T> the type of the claim
     * @return the extracted claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    } 

    /**
     * Extracts all claims from a JWT token.
     * @param token the JWT token
     * @return the claims object
     */
    private Claims extractAllClaims(String token){
        return Jwts
                .parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Retrieves the signing key for JWT operations.
     * @return the secret signing key
     */
    private SecretKey getSignInKey() {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(SECRET_KEY);
        return new javax.crypto.spec.SecretKeySpec(keyBytes, 0, keyBytes.length, "HmacSHA256");
    }

    /**
     * Extracts the user role from a JWT token.
     * @param token the JWT token
     * @return the user role as a string
     */
    public String extractRole(String token) {
        String role = extractClaim(token, claims -> claims.get("role", String.class));
        return role;
    }

    /**
     * Generates a new access token for a user, including the user's role as a claim.
     * @param user the user entity
     * @return the generated access token
     */
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        String role = user.getRole().name();
        claims.put("role", role);
        return generateAccessToken(claims, user);
    }

    /**
     * Generates a new access token with extra claims for a user.
     * @param extraClaims additional claims to include
     * @param userDetails the user details
     * @return the generated access token
     */
    public String generateAccessToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
        ){
            return Jwts
                    .builder()
                    .claims(extraClaims)
                    .subject(userDetails.getUsername())
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 15)) // 5 minutes
                    .signWith(getSignInKey())
                    .compact();
    }

    /**
     * Generates a new refresh token for a user, including the user's role as a claim.
     * @param user the user entity
     * @return the generated refresh token
     */
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name()); 
        return generateRefreshToken(user,claims);
    }

    /**
     * Generates a new refresh token with extra claims for a user.
     * @param userDetails the user details
     * @param extraClaims additional claims to include
     * @return the generated refresh token
     */
    public String generateRefreshToken(
        UserDetails userDetails,
        Map<String, Object> extraClaims)
        {
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() +  1000 * 60 * 60 )) // 1 hour
                .signWith(getSignInKey())
                .compact();
    }
    
    /**
     * Extracts the expiration date from a JWT token.
     * @param token the JWT token
     * @return the expiration date
     */
    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }
    /**
     * Checks if a JWT token is expired.
     * @param token the JWT token
     * @return true if the token is expired, false otherwise
     */
    private Boolean isTokenExpired(String token){
        if (extractExpiration(token).before(new Date())) {
            // delete token from database
            tokenRepository.deleteByToken(token);
            return true;
        }
        return false;
    }
    /**
     * Validates a JWT token against the provided user details.
     * @param token the JWT token
     * @param userDetails the user details
     * @return true if the token is valid and not expired, false otherwise
     */
    public Boolean isTokenValid(String token, UserDetails userDetails){
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}

