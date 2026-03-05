package com.netomonteiro.bancodigital.dto.response;

public record AuditLogResponseDTO(
    Long id,
    Long actorId,
    String actorEmail,
    String actorRole,
    String action,
    String entityType,
    String entityId,
    String details,
    String createdAt
) {}