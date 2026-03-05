package com.netomonteiro.bancodigital.security;

import java.util.Locale;

public final class SecurityAccessHelper {

    private SecurityAccessHelper() {}

    public static boolean isGerente(JwtPrincipal principal) {
        if (principal == null || principal.role() == null) {
            return false;
        }

        String role = principal.role().toUpperCase(Locale.ROOT);
        return "GERENTE".equals(role) || "ADMIN".equals(role);
    }

    public static boolean isCliente(JwtPrincipal principal) {
        if (principal == null || principal.role() == null) {
            return false;
        }

        return "CLIENTE".equals(principal.role().toUpperCase(Locale.ROOT));
    }

    public static boolean canAccessUser(JwtPrincipal principal, Long userId) {
        return principal != null
            && userId != null
            && (isGerente(principal) || userId.equals(principal.userId()));
    }

    public static boolean canAccessOwnCustomer(JwtPrincipal principal, Long userId) {
        return principal != null
            && userId != null
            && isCliente(principal)
            && userId.equals(principal.userId());
    }
}
