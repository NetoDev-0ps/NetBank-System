package com.netomonteiro.bancodigital.config;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    private static final int MIN_SECRET_LENGTH = 32;

    private String secret;
    private List<String> previousSecrets = new ArrayList<>();
    private long expirationMinutes = 60;
    private String issuer = "netbank-api";

    @PostConstruct
    void validate() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET_NAO_CONFIGURADO");
        }

        if (secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException("JWT_SECRET_DEVE_TER_NO_MINIMO_32_CARACTERES");
        }

        if (expirationMinutes <= 0) {
            throw new IllegalStateException("JWT_EXP_MINUTES_DEVE_SER_MAIOR_QUE_ZERO");
        }

        previousSecrets = previousSecrets
            .stream()
            .filter(value -> value != null && !value.isBlank())
            .map(String::trim)
            .collect(Collectors.toList());

        for (String previous : previousSecrets) {
            if (previous.length() < MIN_SECRET_LENGTH) {
                throw new IllegalStateException("JWT_PREVIOUS_SECRET_INVALIDO");
            }
        }

        if (issuer == null || issuer.isBlank()) {
            throw new IllegalStateException("JWT_ISSUER_NAO_CONFIGURADO");
        }
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public List<String> getPreviousSecrets() {
        return previousSecrets;
    }

    public void setPreviousSecrets(List<String> previousSecrets) {
        this.previousSecrets = previousSecrets == null ? new ArrayList<>() : previousSecrets;
    }

    public long getExpirationMinutes() {
        return expirationMinutes;
    }

    public void setExpirationMinutes(long expirationMinutes) {
        this.expirationMinutes = expirationMinutes;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }
}