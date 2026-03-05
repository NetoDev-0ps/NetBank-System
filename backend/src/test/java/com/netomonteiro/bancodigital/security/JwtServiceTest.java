package com.netomonteiro.bancodigital.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.netomonteiro.bancodigital.config.JwtProperties;
import java.util.List;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    @Test
    void shouldGenerateAndValidateToken() {
        JwtService jwtService = new JwtService(buildProperties(
            "super-secret-key-with-32-characters!!",
            List.of(),
            60,
            "test-suite"
        ));

        String token = jwtService.generateToken(10L, "user@test.com", "CLIENTE");
        JwtPrincipal principal = jwtService.validateAndGetPrincipal(token);

        assertNotNull(token);
        assertEquals(10L, principal.userId());
        assertEquals("user@test.com", principal.email());
        assertEquals("CLIENTE", principal.role());
    }

    @Test
    void shouldAcceptTokenSignedWithPreviousSecretDuringRotation() {
        JwtService oldService = new JwtService(buildProperties(
            "old-secret-key-with-32-characters!!!!",
            List.of(),
            60,
            "test-suite"
        ));

        String oldToken = oldService.generateToken(99L, "admin@test.com", "GERENTE");

        JwtService rotatedService = new JwtService(buildProperties(
            "new-secret-key-with-32-characters!!!!",
            List.of("old-secret-key-with-32-characters!!!!"),
            60,
            "test-suite"
        ));

        JwtPrincipal principal = rotatedService.validateAndGetPrincipal(oldToken);
        assertEquals(99L, principal.userId());
        assertEquals("GERENTE", principal.role());
    }

    @Test
    void shouldRejectTokenWithInvalidSignature() {
        JwtService jwtService = new JwtService(buildProperties(
            "super-secret-key-with-32-characters!!",
            List.of(),
            60,
            "test-suite"
        ));

        String token = jwtService.generateToken(99L, "a@b.com", "GERENTE");
        String tokenAdulterado = token.substring(0, token.length() - 2) + "xx";

        assertThrows(
            IllegalArgumentException.class,
            () -> jwtService.validateAndGetPrincipal(tokenAdulterado)
        );
    }

    private JwtProperties buildProperties(
        String secret,
        List<String> previous,
        long expMinutes,
        String issuer
    ) {
        JwtProperties props = new JwtProperties();
        props.setSecret(secret);
        props.setPreviousSecrets(previous);
        props.setExpirationMinutes(expMinutes);
        props.setIssuer(issuer);
        return props;
    }
}