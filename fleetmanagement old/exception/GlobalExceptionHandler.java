package com.zemenbank.fleetmanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Global exception handler for REST controllers.
 * 
 * Catches and handles specific and generic exceptions, returning appropriate HTTP responses and error messages.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles invalid credentials exceptions (e.g., failed login).
     * Returns 401 Unauthorized.
     */
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Object> handleInvalidCredentials(InvalidCredentialsException ex, WebRequest request) {
        return buildResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles user already exists exceptions (e.g., duplicate registration).
     * Returns 409 Conflict.
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Object> handleUserExists(UserAlreadyExistsException ex, WebRequest request) {
        return buildResponse(ex.getMessage(), HttpStatus.CONFLICT);
    }

    /**
     * Handles token expired exceptions (e.g., expired JWT).
     * Returns 401 Unauthorized.
     */
    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<Object> handleTokenExpired(TokenExpiredException ex, WebRequest request) {
        return buildResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles access denied exceptions (e.g., insufficient permissions).
     * Returns 403 Forbidden.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        return buildResponse(ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    /**
     * Handles all other uncaught exceptions.
     * Returns 500 Internal Server Error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllOtherExceptions(Exception ex, WebRequest request) {
        return buildResponse("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Builds a standardized error response body with timestamp, status, error, and message.
     * @param message the error message
     * @param status the HTTP status
     * @return ResponseEntity with error details
     */
    private ResponseEntity<Object> buildResponse(String message, HttpStatus status) {
        return new ResponseEntity<>(
            Map.of(
                "timestamp", LocalDateTime.now(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
            ),
            status
        );
    }
}
