package com.netomonteiro.bancodigital.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AlterarStatusRequest(
    @NotBlank(message = "STATUS_OBRIGATORIO")
    String status
) {}