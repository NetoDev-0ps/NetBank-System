package com.netomonteiro.bancodigital.dto.response;

public record UsuarioStatsResponseDTO(
    long total,
    long ativos,
    long pendentes,
    long suspensas,
    long bloqueadas,
    long recusadas
) {}
