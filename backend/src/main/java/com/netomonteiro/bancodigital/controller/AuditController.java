package com.netomonteiro.bancodigital.controller;

import com.netomonteiro.bancodigital.dto.response.AuditLogResponseDTO;
import com.netomonteiro.bancodigital.model.AuditLog;
import com.netomonteiro.bancodigital.service.AuditService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auditoria")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<AuditLogResponseDTO>> listar() {
        List<AuditLogResponseDTO> payload = auditService
            .listarRecentes()
            .stream()
            .map(this::converter)
            .toList();

        return ResponseEntity.ok(payload);
    }

    private AuditLogResponseDTO converter(AuditLog entry) {
        return new AuditLogResponseDTO(
            entry.getId(),
            entry.getActorId(),
            entry.getActorEmail(),
            entry.getActorRole(),
            entry.getAction(),
            entry.getEntityType(),
            entry.getEntityId(),
            entry.getDetails(),
            entry.getCreatedAt() == null ? null : entry.getCreatedAt().toString()
        );
    }
}