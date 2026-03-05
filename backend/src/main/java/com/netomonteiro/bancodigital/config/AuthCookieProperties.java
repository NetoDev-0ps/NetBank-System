package com.netomonteiro.bancodigital.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "auth.cookie")
public class AuthCookieProperties {

    private String name = "NETBANK_AUTH";
    private boolean secure = false;
    private String sameSite = "Strict";
    private String path = "/";

    @PostConstruct
    void validate() {
        if (name == null || name.isBlank()) {
            throw new IllegalStateException("AUTH_COOKIE_NAME_INVALIDO");
        }

        if (sameSite == null || sameSite.isBlank()) {
            throw new IllegalStateException("AUTH_COOKIE_SAMESITE_INVALIDO");
        }

        if (path == null || path.isBlank()) {
            throw new IllegalStateException("AUTH_COOKIE_PATH_INVALIDO");
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isSecure() {
        return secure;
    }

    public void setSecure(boolean secure) {
        this.secure = secure;
    }

    public String getSameSite() {
        return sameSite;
    }

    public void setSameSite(String sameSite) {
        this.sameSite = sameSite;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}