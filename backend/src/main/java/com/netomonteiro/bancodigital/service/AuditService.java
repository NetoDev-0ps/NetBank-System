package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.model.AuditLog;
import com.netomonteiro.bancodigital.repository.AuditLogRepository;
import com.netomonteiro.bancodigital.security.JwtPrincipal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void registrar(
        JwtPrincipal principal,
        String action,
        String entityType,
        String entityId,
        String details
    ) {
        if (principal == null) {
            return;
        }

        registrar(
            principal.userId(),
            principal.email(),
            principal.role(),
            action,
            entityType,
            entityId,
            details
        );
    }

    public void registrar(
        Long actorId,
        String actorEmail,
        String actorRole,
        String action,
        String entityType,
        String entityId,
        String details
    ) {
        if (actorId == null || action == null || action.isBlank() || entityType == null || entityType.isBlank()) {
            return;
        }

        AuditLog entry = new AuditLog();
        entry.setActorId(actorId);
        entry.setActorEmail(actorEmail == null ? "desconhecido" : actorEmail);
        entry.setActorRole(actorRole == null ? "DESCONHECIDO" : actorRole);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDetails(details);

        auditLogRepository.save(entry);
    }

    public List<AuditLog> listarRecentes() {
        return auditLogRepository.findTop200ByOrderByCreatedAtDesc();
    }
}