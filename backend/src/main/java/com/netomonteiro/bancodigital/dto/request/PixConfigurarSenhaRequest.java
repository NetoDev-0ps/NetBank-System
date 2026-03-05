package com.netomonteiro.bancodigital.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PixConfigurarSenhaRequest(
    @NotNull(message = "O campo 'usuarioId' e obrigatorio.")
    Long usuarioId,
    @NotBlank(message = "O campo 'senha' e obrigatorio.")
    String senha
) {}

