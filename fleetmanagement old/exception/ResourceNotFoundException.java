package com.zemenbank.fleetmanagement.exception;

/**
 * Exception thrown when a requested resource is not found in the system.
 * 
 * Used to signal missing entities such as users, vehicles, or other records.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new exception with a detail message.
     * @param message the detail message
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructs a new exception with a detail message and cause.
     * @param message the detail message
     * @param cause the cause of the exception
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
}
