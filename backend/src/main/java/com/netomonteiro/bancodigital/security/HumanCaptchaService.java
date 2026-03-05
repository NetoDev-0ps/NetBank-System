package com.netomonteiro.bancodigital.security;

import com.netomonteiro.bancodigital.config.CaptchaProperties;
import com.netomonteiro.bancodigital.config.JwtProperties;
import com.netomonteiro.bancodigital.dto.response.CaptchaChallengeResponse;
import com.netomonteiro.bancodigital.dto.response.CaptchaVerifyResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class HumanCaptchaService {

    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_TARGET = "target";
    private static final String CLAIM_TOLERANCE = "tolerance";
    private static final String CLAIM_CHALLENGE_ID = "cid";
    private static final String CLAIM_PROOF_ID = "pid";
    private static final String CLAIM_IP_HASH = "iph";

    private static final String TYPE_CHALLENGE = "CAPTCHA_CHALLENGE";
    private static final String TYPE_PROOF = "CAPTCHA_PROOF";

    private final JwtProperties jwtProperties;
    private final CaptchaProperties captchaProperties;
    private final SecretKey signingKey;
    private final Map<String, Instant> usedChallenges = new ConcurrentHashMap<>();
    private final Map<String, Instant> usedProofs = new ConcurrentHashMap<>();

    public HumanCaptchaService(JwtProperties jwtProperties, CaptchaProperties captchaProperties) {
        this.jwtProperties = jwtProperties;
        this.captchaProperties = captchaProperties;
        String keyMaterial = jwtProperties.getSecret() + "|captcha|v1";
        this.signingKey = Keys.hmacShaKeyFor(keyMaterial.getBytes(StandardCharsets.UTF_8));
    }

    public CaptchaChallengeResponse issueChallenge() {
        cleanupExpiredEntries();

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(captchaProperties.getChallengeTtlSeconds());
        int min = captchaProperties.getMinValue();
        int max = captchaProperties.getMaxValue();
        int target = min + (int) Math.floor(Math.random() * (max - min + 1));

        String challengeId = UUID.randomUUID().toString();

        String challengeToken = Jwts
            .builder()
            .issuer(jwtProperties.getIssuer())
            .subject(TYPE_CHALLENGE)
            .claim(CLAIM_TYPE, TYPE_CHALLENGE)
            .claim(CLAIM_TARGET, target)
            .claim(CLAIM_TOLERANCE, captchaProperties.getTolerance())
            .claim(CLAIM_CHALLENGE_ID, challengeId)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(signingKey, Jwts.SIG.HS256)
            .compact();

        return new CaptchaChallengeResponse(
            challengeToken,
            target,
            min,
            max,
            captchaProperties.getTolerance(),
            captchaProperties.getChallengeTtlSeconds()
        );
    }

    public CaptchaVerifyResponse verifyChallenge(
        String challengeToken,
        Integer sliderValue,
        String clientIp
    ) {
        if (sliderValue == null) {
            throw new IllegalArgumentException("CAPTCHA_SLIDER_OBRIGATORIO");
        }

        Claims claims = parseClaims(challengeToken, TYPE_CHALLENGE, "CAPTCHA_CHALLENGE_INVALIDO");
        String challengeId = claims.get(CLAIM_CHALLENGE_ID, String.class);

        if (challengeId == null || challengeId.isBlank()) {
            throw new IllegalArgumentException("CAPTCHA_CHALLENGE_INVALIDO");
        }

        Instant challengeExpiration = claims.getExpiration().toInstant();
        if (usedChallenges.putIfAbsent(challengeId, challengeExpiration) != null) {
            throw new IllegalArgumentException("CAPTCHA_CHALLENGE_REUTILIZADO");
        }

        int target = asInt(claims.get(CLAIM_TARGET));
        int tolerance = asInt(claims.get(CLAIM_TOLERANCE));

        if (Math.abs(sliderValue - target) > tolerance) {
            throw new IllegalArgumentException("CAPTCHA_VERIFICACAO_FALHOU");
        }

        Instant now = Instant.now();
        Instant proofExpiresAt = now.plusSeconds(captchaProperties.getProofTtlSeconds());
        String proofId = UUID.randomUUID().toString();

        String proofToken = Jwts
            .builder()
            .issuer(jwtProperties.getIssuer())
            .subject(TYPE_PROOF)
            .claim(CLAIM_TYPE, TYPE_PROOF)
            .claim(CLAIM_PROOF_ID, proofId)
            .claim(CLAIM_IP_HASH, hashIp(clientIp))
            .issuedAt(Date.from(now))
            .expiration(Date.from(proofExpiresAt))
            .signWith(signingKey, Jwts.SIG.HS256)
            .compact();

        return new CaptchaVerifyResponse(proofToken, captchaProperties.getProofTtlSeconds());
    }

    public void consumeProof(String proofToken, String clientIp) {
        if (!captchaProperties.isEnabled()) {
            return;
        }

        if (proofToken == null || proofToken.isBlank()) {
            throw new IllegalArgumentException("CAPTCHA_PROOF_AUSENTE");
        }

        Claims claims = parseClaims(proofToken, TYPE_PROOF, "CAPTCHA_PROOF_INVALIDO");

        String proofId = claims.get(CLAIM_PROOF_ID, String.class);
        String ipHash = claims.get(CLAIM_IP_HASH, String.class);

        if (proofId == null || proofId.isBlank() || ipHash == null || ipHash.isBlank()) {
            throw new IllegalArgumentException("CAPTCHA_PROOF_INVALIDO");
        }

        if (!Objects.equals(ipHash, hashIp(clientIp))) {
            throw new IllegalArgumentException("CAPTCHA_PROOF_IP_INVALIDO");
        }

        Instant expiration = claims.getExpiration().toInstant();
        if (usedProofs.putIfAbsent(proofId, expiration) != null) {
            throw new IllegalArgumentException("CAPTCHA_PROOF_REUTILIZADO");
        }

        cleanupExpiredEntries();
    }

    private Claims parseClaims(String token, String expectedType, String invalidCode) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(invalidCode);
        }

        try {
            Claims claims = Jwts
                .parser()
                .verifyWith(signingKey)
                .requireIssuer(jwtProperties.getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();

            String type = claims.get(CLAIM_TYPE, String.class);
            if (!Objects.equals(expectedType, type)) {
                throw new IllegalArgumentException(invalidCode);
            }

            return claims;
        } catch (JwtException ex) {
            throw new IllegalArgumentException(invalidCode);
        }
    }

    private int asInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }

    private void cleanupExpiredEntries() {
        Instant now = Instant.now();
        usedChallenges.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
        usedProofs.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }

    private String hashIp(String clientIp) {
        String normalizedIp = (clientIp == null || clientIp.isBlank()) ? "unknown" : clientIp.trim();

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalizedIp.getBytes(StandardCharsets.UTF_8));
            return toHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("ERRO_HASH_CAPTCHA", ex);
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            builder.append(String.format("%02x", value));
        }
        return builder.toString();
    }
}
