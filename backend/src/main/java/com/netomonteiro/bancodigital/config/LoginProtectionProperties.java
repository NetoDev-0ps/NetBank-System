package com.netomonteiro.bancodigital.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "auth.login-protection")
public class LoginProtectionProperties {

    private boolean enabled = true;
    private int maxAttempts = 5;
    private int attemptWindowMinutes = 15;
    private int lockMinutes = 15;

    @PostConstruct
    void validate() {
        if (maxAttempts <= 0) {
            throw new IllegalStateException("AUTH_LOGIN_PROTECTION_MAX_ATTEMPTS_INVALIDO");
        }

        if (attemptWindowMinutes <= 0) {
            throw new IllegalStateException("AUTH_LOGIN_PROTECTION_ATTEMPT_WINDOW_INVALIDO");
        }

        if (lockMinutes <= 0) {
            throw new IllegalStateException("AUTH_LOGIN_PROTECTION_LOCK_MINUTES_INVALIDO");
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public int getAttemptWindowMinutes() {
        return attemptWindowMinutes;
    }

    public void setAttemptWindowMinutes(int attemptWindowMinutes) {
        this.attemptWindowMinutes = attemptWindowMinutes;
    }

    public int getLockMinutes() {
        return lockMinutes;
    }

    public void setLockMinutes(int lockMinutes) {
        this.lockMinutes = lockMinutes;
    }
}
