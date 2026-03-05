package com.netomonteiro.bancodigital.security;

import com.netomonteiro.bancodigital.config.LoginProtectionProperties;
import com.netomonteiro.bancodigital.model.LoginAttempt;
import com.netomonteiro.bancodigital.repository.LoginAttemptRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private final LoginProtectionProperties properties;
    private final LoginAttemptRepository loginAttemptRepository;

    @Transactional
    public void assertNotBlocked(String loginKey) {
        if (!properties.isEnabled()) {
            return;
        }

        String normalizedKey = normalizeKey(loginKey);
        LoginAttempt current = loginAttemptRepository.findByLoginKeyForUpdate(normalizedKey).orElse(null);

        if (current == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        if (current.getLockUntil() != null && now.isBefore(current.getLockUntil())) {
            long retryAfterSeconds = Math.max(1L, Duration.between(now, current.getLockUntil()).getSeconds());
            throw new LoginBlockedException(retryAfterSeconds);
        }

        if (current.getLockUntil() != null && !now.isBefore(current.getLockUntil())) {
            loginAttemptRepository.delete(current);
        }
    }

    @Transactional
    public void registerSuccess(String loginKey) {
        if (!properties.isEnabled()) {
            return;
        }

        loginAttemptRepository.deleteById(normalizeKey(loginKey));
    }

    @Transactional
    public void registerFailure(String loginKey) {
        if (!properties.isEnabled()) {
            return;
        }

        String normalizedKey = normalizeKey(loginKey);
        LocalDateTime now = LocalDateTime.now();

        LoginAttempt current = loginAttemptRepository
            .findByLoginKeyForUpdate(normalizedKey)
            .orElseGet(() -> new LoginAttempt(normalizedKey));

        if (current.getLockUntil() != null && now.isAfter(current.getLockUntil())) {
            current.setLockUntil(null);
            current.setFailures(0);
            current.setFirstFailureAt(now);
        }

        Duration window = Duration.ofMinutes(properties.getAttemptWindowMinutes());
        if (
            current.getFirstFailureAt() == null ||
            Duration.between(current.getFirstFailureAt(), now).compareTo(window) > 0
        ) {
            current.setFailures(1);
            current.setFirstFailureAt(now);
            current.setLockUntil(null);
        } else {
            current.setFailures(current.getFailures() + 1);
        }

        if (current.getFailures() >= properties.getMaxAttempts()) {
            current.setLockUntil(now.plusMinutes(properties.getLockMinutes()));
        }

        loginAttemptRepository.save(current);
    }

    private String normalizeKey(String loginKey) {
        String safeKey = Objects.requireNonNullElse(loginKey, "UNKNOWN_LOGIN_KEY");
        return safeKey.trim().isEmpty() ? "UNKNOWN_LOGIN_KEY" : safeKey.trim().toUpperCase();
    }
}
