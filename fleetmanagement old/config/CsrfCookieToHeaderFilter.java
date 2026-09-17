package com.zemenbank.fleetmanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

public class CsrfCookieToHeaderFilter extends OncePerRequestFilter {

    private static final String CSRF_COOKIE_NAME = "XSRF-TOKEN";
    private static final String CSRF_HEADER_NAME = "X-XSRF-TOKEN";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String method = request.getMethod();
        boolean stateChanging = "POST".equalsIgnoreCase(method) ||
                "PUT".equalsIgnoreCase(method) ||
                "PATCH".equalsIgnoreCase(method) ||
                "DELETE".equalsIgnoreCase(method);

        // Only attach CSRF header for unsafe methods
        if (!stateChanging) {
            filterChain.doFilter(request, response);
            return;
        }

        String csrfTokenValue = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (CSRF_COOKIE_NAME.equals(cookie.getName())) {
                    csrfTokenValue = cookie.getValue();
                    break;
                }
            }
        }

        if (csrfTokenValue == null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = csrfTokenValue;

        HttpServletRequest wrapped = new HttpServletRequestWrapper(request) {
            @Override
            public String getHeader(String name) {
                if (CSRF_HEADER_NAME.equalsIgnoreCase(name)) {
                    return token;
                }
                return super.getHeader(name);
            }

            @Override
            public Enumeration<String> getHeaderNames() {
                List<String> names = new ArrayList<>(Collections.list(super.getHeaderNames()));
                if (!names.contains(CSRF_HEADER_NAME)) {
                    names.add(CSRF_HEADER_NAME);
                }
                return Collections.enumeration(names);
            }
        };

        filterChain.doFilter(wrapped, response);
    }
}
