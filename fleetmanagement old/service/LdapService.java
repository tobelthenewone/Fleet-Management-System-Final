package com.zemenbank.fleetmanagement.service;


public interface LdapService {
    boolean authenticate(String username, String password);
    boolean userExists(String username);
    
}
