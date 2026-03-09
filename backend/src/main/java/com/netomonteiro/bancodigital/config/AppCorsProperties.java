package com.netomonteiro.bancodigital.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.cors")
public class AppCorsProperties {

    private List<String> allowedOrigins = List.of("http://localhost:*", "http://127.0.0.1:*");

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            this.allowedOrigins = List.of("http://localhost:*", "http://127.0.0.1:*");
            return;
        }

        this.allowedOrigins = allowedOrigins;
    }
}
