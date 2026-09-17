package com.zemenbank.fleetmanagement.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.ProceedingJoinPoint;
import java.util.Collection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * Pointcut: define where logging should apply.
     * This example targets all methods in com.zemenbank.fleetmanagement.service package.
     */
    @Pointcut("execution(* com.zemenbank.fleetmanagement.service..*(..))")
    public void applicationServiceMethods() {}

    /**
     * Log before method execution
     */
    @Before("applicationServiceMethods()")
    public void logBefore(JoinPoint joinPoint) {
        try {
            logger.info("User: {} Entering method: {} with arguments: {}",
                    getCurrentUser(),
                    joinPoint.getSignature(),
                    summarizeArgs(joinPoint.getArgs()));
        } catch (Throwable t) {
            // Don't let logging fail the call; log a safe fallback
            logger.info("User: {} Entering method: {} (args unavailable)", getCurrentUser(), joinPoint.getSignature());
        }
    }

    /**
     * Log after method execution
     */
    @After("applicationServiceMethods()")
    public void logAfter(JoinPoint joinPoint) {
        logger.info("User: {} Exiting method: {}", getCurrentUser(), joinPoint.getSignature());
    }

    /**
     * Log execution time and return value
     */
    @Around("applicationServiceMethods()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        Object result = joinPoint.proceed(); // proceed with method call

        long elapsedTime = System.currentTimeMillis() - start;

        // Avoid logging the full 'result' object because calling toString() on
        // returned entities or collections can trigger lazy-loading or expensive
        // serialization inside the service/interceptor which may cause runtime
        // errors (LazyInitializationException) or blow up the logs. Instead,
        // log a safe summary: null, simple class name, or collection size.
        String resultSummary;
        try {
            if (result == null) {
                resultSummary = "null";
            } else if (result instanceof Collection) {
                resultSummary = "Collection(size=" + ((Collection<?>) result).size() + ")";
            } else {
                resultSummary = result.getClass().getSimpleName();
            }
        } catch (Throwable t) {
            // If summarizing fails for any reason, fall back to a safe placeholder.
            resultSummary = "<unavailable>";
        }

        logger.info("User: {} Executed method: {} in {} ms. Result: {}",
                getCurrentUser(),
                joinPoint.getSignature(),
                elapsedTime,
                resultSummary);

        return result;
    }
    // get user from security context
    private String getCurrentUser() {
        // get logged user form security context user
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                return (authentication != null) ? authentication.getName() : "Anonymous";

        
    }

    // Produce a safe, non-evaluating summary of method arguments to avoid
    // triggering lazy-loads or expensive toString() calls before transactions
    private String summarizeArgs(Object[] args) {
        if (args == null || args.length == 0) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < args.length; i++) {
            Object a = args[i];
            if (a == null) {
                sb.append("null");
            } else if (a instanceof CharSequence || a instanceof Number || a instanceof Boolean) {
                sb.append(a.toString());
            } else if (a instanceof java.util.Collection) {
                sb.append("Collection(size=").append(((java.util.Collection<?>) a).size()).append(")");
            } else if (a instanceof java.util.Map) {
                sb.append("Map(size=").append(((java.util.Map<?, ?>) a).size()).append(")");
            } else {
                sb.append(a.getClass().getSimpleName());
            }
            if (i < args.length - 1) sb.append(", ");
        }
        sb.append("]");
        return sb.toString();
    }
}
