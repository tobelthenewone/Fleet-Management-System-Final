package com.zemenbank.fleetmanagement.exception;

public class TokenExpiredException extends RuntimeException {
    public TokenExpiredException() {
        super("JWT token has expired.");
    }

    public TokenExpiredException(String message) {
        super(message);
    }
}
