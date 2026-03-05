package com.netomonteiro.bancodigital.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class SecurityAccessHelperTest {

    @Test
    void shouldAllowManagerToAccessAnyUser() {
        JwtPrincipal manager = new JwtPrincipal(999L, "admin@netbank.com", "GERENTE");

        assertTrue(SecurityAccessHelper.canAccessUser(manager, 1L));
    }

    @Test
    void shouldAllowUserToAccessOwnData() {
        JwtPrincipal cliente = new JwtPrincipal(7L, "cliente@netbank.com", "CLIENTE");

        assertTrue(SecurityAccessHelper.canAccessUser(cliente, 7L));
    }

    @Test
    void shouldBlockUserFromAccessingAnotherUser() {
        JwtPrincipal cliente = new JwtPrincipal(7L, "cliente@netbank.com", "CLIENTE");

        assertFalse(SecurityAccessHelper.canAccessUser(cliente, 8L));
    }

    @Test
    void shouldAllowOnlyCustomerOwnAccessOnRestrictedFlows() {
        JwtPrincipal cliente = new JwtPrincipal(7L, "cliente@netbank.com", "CLIENTE");
        JwtPrincipal gerente = new JwtPrincipal(9L, "gerente@netbank.com", "GERENTE");

        assertTrue(SecurityAccessHelper.canAccessOwnCustomer(cliente, 7L));
        assertFalse(SecurityAccessHelper.canAccessOwnCustomer(cliente, 8L));
        assertFalse(SecurityAccessHelper.canAccessOwnCustomer(gerente, 7L));
    }
}
