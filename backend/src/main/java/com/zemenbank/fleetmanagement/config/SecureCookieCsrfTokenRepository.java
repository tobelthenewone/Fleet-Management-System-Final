package com.zemenbank.fleetmanagement.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

/**
 * Secure CSRF Token Repository for production:
 * - Uses HttpOnly + Secure cookies
 * - Compatible with Spring Security 6.1+
 */
public class SecureCookieCsrfTokenRepository implements CsrfTokenRepository {

    private final CookieCsrfTokenRepository delegate;
    private final boolean secure;

    public SecureCookieCsrfTokenRepository(boolean secure) {
        this.secure = secure;
        this.delegate = CookieCsrfTokenRepository.withHttpOnlyFalse(); // allow Axios to send header
        this.delegate.setCookieName("XSRF-TOKEN");
        this.delegate.setHeaderName("X-XSRF-TOKEN");
        this.delegate.setCookiePath("/");
    }

    @Override
    public CsrfToken generateToken(HttpServletRequest request) {
        return delegate.generateToken(request);
    }

    @Override
    public void saveToken(CsrfToken token, HttpServletRequest request, HttpServletResponse response) {
        // Remove cookie if token is null
        if (token == null) {
            ResponseCookie removeCookie = ResponseCookie.from("XSRF-TOKEN", "")
                    .path("/")
                    .maxAge(0)
                    .httpOnly(true)
                    .secure(secure)
                    .sameSite("Lax")
                    .build();
            response.addHeader("Set-Cookie", removeCookie.toString());
            return;
        }

        // Let delegate save token internally
        delegate.saveToken(token, request, response);

        // Override with secure flags
        ResponseCookie secureCookie = ResponseCookie.from("XSRF-TOKEN", token.getToken())
                .path("/")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", secureCookie.toString());
    }

    @Override
    public CsrfToken loadToken(HttpServletRequest request) {
        return delegate.loadToken(request);
    }
}
