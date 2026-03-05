package com.netomonteiro.bancodigital.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "auth.captcha")
public class CaptchaProperties {

    private boolean enabled = true;
    private int challengeTtlSeconds = 180;
    private int proofTtlSeconds = 120;
    private int tolerance = 4;
    private int minValue = 0;
    private int maxValue = 100;

    @PostConstruct
    void validate() {
        if (challengeTtlSeconds < 30 || challengeTtlSeconds > 900) {
            throw new IllegalStateException("AUTH_CAPTCHA_CHALLENGE_TTL_INVALIDO");
        }

        if (proofTtlSeconds < 30 || proofTtlSeconds > 900) {
            throw new IllegalStateException("AUTH_CAPTCHA_PROOF_TTL_INVALIDO");
        }

        if (tolerance < 1 || tolerance > 10) {
            throw new IllegalStateException("AUTH_CAPTCHA_TOLERANCE_INVALIDA");
        }

        if (minValue < 0 || maxValue > 100 || minValue >= maxValue) {
            throw new IllegalStateException("AUTH_CAPTCHA_RANGE_INVALIDO");
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getChallengeTtlSeconds() {
        return challengeTtlSeconds;
    }

    public void setChallengeTtlSeconds(int challengeTtlSeconds) {
        this.challengeTtlSeconds = challengeTtlSeconds;
    }

    public int getProofTtlSeconds() {
        return proofTtlSeconds;
    }

    public void setProofTtlSeconds(int proofTtlSeconds) {
        this.proofTtlSeconds = proofTtlSeconds;
    }

    public int getTolerance() {
        return tolerance;
    }

    public void setTolerance(int tolerance) {
        this.tolerance = tolerance;
    }

    public int getMinValue() {
        return minValue;
    }

    public void setMinValue(int minValue) {
        this.minValue = minValue;
    }

    public int getMaxValue() {
        return maxValue;
    }

    public void setMaxValue(int maxValue) {
        this.maxValue = maxValue;
    }
}
