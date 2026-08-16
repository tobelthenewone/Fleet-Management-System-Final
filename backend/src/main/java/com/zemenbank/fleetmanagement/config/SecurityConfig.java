package com.zemenbank.fleetmanagement.config;

import com.zemenbank.fleetmanagement.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf-> csrf.disable())
            // .csrf(csrf -> csrf
            //         .csrfTokenRepository(new SecureCookieCsrfTokenRepository(true))
            //         .ignoringRequestMatchers(new AntPathRequestMatcher("/api/v1/auth/**")))            
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(requests -> requests
                    .requestMatchers("/api/v1/register").hasAnyRole(Role.ADMIN.name(), Role.LOGISTICS_OFFICER.name(), Role.LOGISTICS_HEAD.name())
                    .requestMatchers("/api/v1/admin/**").hasAnyRole(Role.ADMIN.name(), Role.LOGISTICS_OFFICER.name(), Role.LOGISTICS_HEAD.name())
                    .requestMatchers("/api/v1/auth/**").permitAll()
                    .requestMatchers("/api/v1/logistics/**").hasAnyRole(Role.ADMIN.name(), Role.LOGISTICS_OFFICER.name(), Role.LOGISTICS_HEAD.name(), Role.JOURNEY_CONTROLLER.name())
                    .requestMatchers("/api/v1/vehicles/logistics/**").hasAnyRole(Role.ADMIN.name(), Role.LOGISTICS_OFFICER.name(), Role.LOGISTICS_HEAD.name(), Role.JOURNEY_CONTROLLER.name())
                    .requestMatchers("/api/v1/requests/department/**").hasAnyRole(Role.ADMIN.name(), Role.DEPARTMENT_HEAD.name(), Role.LOGISTICS_OFFICER.name(), Role.DIRECTOR.name())
                    .requestMatchers("/api/v1/requests/logistics/**").hasAnyRole(Role.ADMIN.name(), Role.LOGISTICS_OFFICER.name(), Role.LOGISTICS_HEAD.name(), Role.JOURNEY_CONTROLLER.name())
                    .anyRequest().authenticated()
            )
           .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CsrfCookieToHeaderFilter csrfCookieToHeaderFilter() {
        return new CsrfCookieToHeaderFilter();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration(); //http://localhost:4000
        configuration.setAllowedOrigins(List.of("http://localhost:3000","http://localhost:4000","https://aps2.zemenbank.com"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization","Content-Type","Accept","X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(10000L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}