package com.zemenbank.fleetmanagement.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.service.LdapService;

import static org.springframework.ldap.query.LdapQueryBuilder.query;


@Service
public class LdapServiceImpl implements LdapService {

    // private final AuthenticationManager authenticationManager;
    @Autowired
    private LdapTemplate ldapTemplate;

    // public boolean authenticatrrre(String username, String password) {
    //     try {
    //         return ldapTemplate.authenticate("", "(uid=" + username + ")", password);
    //     } catch (Exception e) {
    //         return false;
    //     }
    // }
    public boolean authenticate(String username, String password) {
    try {
        return ldapTemplate.authenticate("", "(sAMAccountName=" + username + ")", password);
    } catch (Exception e) {
        // log actual LDAP exception for debugging
        e.printStackTrace();
        return false;
    }
}


    public boolean userExists(String username) {
        return ldapTemplate.search(
                query().where("uid").is(username),
                (AttributesMapper<String>) attrs -> (String) attrs.get("uid").get()
        ).size() > 0;
    }
}

