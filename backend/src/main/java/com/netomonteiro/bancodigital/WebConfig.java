package com.netomonteiro.bancodigital; // <--- Garanta que esse pacote está certo

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
            .addMapping("/**") // Libera todas as rotas
            .allowedOrigins("http://localhost:5173") // Libera EXATAMENTE o seu React
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"); // Libera todos os verbos
    }
}
