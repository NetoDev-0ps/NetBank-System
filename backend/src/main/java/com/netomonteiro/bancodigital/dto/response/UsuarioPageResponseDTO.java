package com.netomonteiro.bancodigital.dto.response;

import java.util.List;

public record UsuarioPageResponseDTO(
    List<UsuarioResponseDTO> items,
    int page,
    int size,
    long totalElements,
    int totalPages,
    UsuarioStatsResponseDTO stats
) {}
