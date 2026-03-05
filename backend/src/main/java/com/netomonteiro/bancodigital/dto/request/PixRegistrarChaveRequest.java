package com.netomonteiro.bancodigital.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PixRegistrarChaveRequest(
    @NotNull(message = "O campo 'usuarioId' e obrigatorio.")
    Long usuarioId,
    @NotBlank(message = "O campo 'tipo' e obrigatorio.")
    String tipo,
    @NotBlank(message = "O campo 'valor' e obrigatorio.")
    String valor
) {}

