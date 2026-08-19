package com.zemenbank.fleetmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Spring Web MVC configuration for custom resource handling.
 * 
 * Configures the application to serve static files (such as uploaded images) from the /uploads directory.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    /**
     * The absolute path to the uploads directory in the project root.
     */
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + File.separator + "fleetmangement" + File.separator + "uploads";

    /**
     * Adds a resource handler to serve files from the /uploads/** URL mapping.
     * Maps to the uploads directory in the project root.
     *
     * @param registry the resource handler registry
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve files from /uploads/** URL mapping to the uploads directory in the project root
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + UPLOAD_DIR + "/");
    }
}
