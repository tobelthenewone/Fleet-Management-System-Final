package com.zemenbank.fleetmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Spring configuration class for application-wide beans related to authentication and user management.
 * 
 * Provides beans for UserDetailsService, AuthenticationProvider, AuthenticationManager, and PasswordEncoder.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    /**
     * Repository for accessing user data.
     */
    private final UserRepository userRepository;
    
    /**
     * Provides a UserDetailsService that loads users by email.
     * Throws ResourceNotFoundException if the user is not found.
     * @return UserDetailsService bean
     */
    @Bean
    public UserDetailsService userDetailsService(){
        return username -> userRepository.findByUsername(username).orElseThrow(()->new ResourceNotFoundException("user not found with this email:"+username));
    }

    /**
     * Provides an AuthenticationProvider using DAO authentication and BCrypt password encoding.
     * @return AuthenticationProvider bean
     */
    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider authProvider=new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    // LDAP
    // @Bean
    // ActiveDirectoryLdapAuthenticationProvider authenticationProvider() {
    //     var ldabAuth =  new ActiveDirectoryLdapAuthenticationProvider("example.local", "ldap://mbdcp02.example.local:portnumber", "");
    //     ldabAuth.setSearchFilter("(&(objectClass=user)(sAMAccountName={1}))");
    //     return ldabAuth;
    // }


    /**
     * Provides the AuthenticationManager bean from the authentication configuration.
     * @param config AuthenticationConfiguration
     * @return AuthenticationManager bean
     * @throws Exception if unable to get the authentication manager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    /**
     * Provides a BCryptPasswordEncoder bean for password hashing.
     * @return PasswordEncoder bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}