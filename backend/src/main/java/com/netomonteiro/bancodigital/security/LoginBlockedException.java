package com.netomonteiro.bancodigital.security;

public class LoginBlockedException extends RuntimeException {

    private final long retryAfterSeconds;

    public LoginBlockedException(long retryAfterSeconds) {
        super("LOGIN_BLOQUEADO_TEMPORARIAMENTE");
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
