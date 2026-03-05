package com.netomonteiro.bancodigital.security;

import com.netomonteiro.bancodigital.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey signingKey;
    private final List<SecretKey> validationKeys;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.signingKey = buildKey(jwtProperties.getSecret());

        List<SecretKey> keys = new ArrayList<>();
        keys.add(signingKey);
        for (String previous : jwtProperties.getPreviousSecrets()) {
            keys.add(buildKey(previous));
        }
        this.validationKeys = List.copyOf(keys);
    }

    public String generateToken(Long userId, String email, String role) {
        try {
            Instant now = Instant.now();
            Instant exp = now.plusSeconds(jwtProperties.getExpirationMinutes() * 60);

            return Jwts
                .builder()
                .issuer(jwtProperties.getIssuer())
                .subject(email)
                .claim("uid", userId)
                .claim("role", role == null ? "CLIENTE" : role.toUpperCase(Locale.ROOT))
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
        } catch (Exception e) {
            throw new IllegalStateException("ERRO_GERAR_TOKEN", e);
        }
    }

    public JwtPrincipal validateAndGetPrincipal(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("TOKEN_AUSENTE");
        }

        IllegalArgumentException lastError = null;

        for (SecretKey key : validationKeys) {
            try {
                Claims claims = Jwts
                    .parser()
                    .verifyWith(key)
                    .requireIssuer(jwtProperties.getIssuer())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

                Long uid = asLong(claims.get("uid"));
                String email = claims.getSubject();
                String role = asString(claims.get("role"));

                if (uid == null || email == null || email.isBlank() || role == null || role.isBlank()) {
                    throw new IllegalArgumentException("TOKEN_CLAIMS_INVALIDAS");
                }

                return new JwtPrincipal(uid, email, role);
            } catch (IllegalArgumentException ex) {
                lastError = ex;
            } catch (JwtException ex) {
                lastError = new IllegalArgumentException("TOKEN_INVALIDO", ex);
            }
        }

        throw (lastError == null ? new IllegalArgumentException("TOKEN_INVALIDO") : lastError);
    }

    private SecretKey buildKey(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.valueOf(String.valueOf(value));
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}