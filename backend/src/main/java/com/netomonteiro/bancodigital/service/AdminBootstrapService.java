package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.config.AdminProperties;
import com.netomonteiro.bancodigital.model.AdminUser;
import com.netomonteiro.bancodigital.repository.AdminUserRepository;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminBootstrapService implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrapService.class);

    private final AdminProperties adminProperties;
    private final AdminUserRepository adminUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!adminProperties.isConfigured()) {
            logger.warn("Admin bootstrap nao configurado. Defina ADMIN_EMAIL e ADMIN_PASSWORD_HASH para provisionar acesso gerente.");
            return;
        }

        String email = normalizarEmail(adminProperties.getEmail());
        String senhaHash = adminProperties.getSenhaHash().trim();

        if (!isBcryptValido(senhaHash)) {
            throw new IllegalStateException("ADMIN_PASSWORD_HASH_INVALIDO");
        }

        AdminUser admin = adminUserRepository
            .findByEmailIgnoreCase(email)
            .orElseGet(AdminUser::new);

        admin.setNome(adminProperties.getNome());
        admin.setEmail(email);
        admin.setSenhaHash(senhaHash);
        admin.setAtivo(true);

        adminUserRepository.save(admin);
    }

    private boolean isBcryptValido(String hash) {
        try {
            passwordEncoder.matches("hash-validation", hash);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}