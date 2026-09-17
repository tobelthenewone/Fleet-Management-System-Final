package com.zemenbank.fleetmanagement.exception;

/**
 * Exception thrown when attempting to create a user that already exists (e.g., duplicate email).
 * 
 * Used to signal a conflict during user registration or creation.
 */
public class UserAlreadyExistsException extends RuntimeException {
    /**
     * Constructs a new exception with a default message indicating a user already exists.
     */
    public UserAlreadyExistsException() {
        super("A user with this email already exists.");
    }

    /**
     * Constructs a new exception with a custom message.
     * @param message the detail message
     */
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
