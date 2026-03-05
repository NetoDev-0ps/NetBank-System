package com.netomonteiro.bancodigital.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PixTransferirRequest(
    @NotNull(message = "O campo 'idOrigem' e obrigatorio.")
    Long idOrigem,
    @NotNull(message = "O campo 'idDestino' e obrigatorio.")
    Long idDestino,
    @NotNull(message = "O campo 'valor' e obrigatorio.")
    @DecimalMin(value = "0.01", message = "O valor da transferencia deve ser maior que zero.")
    BigDecimal valor,
    @NotBlank(message = "O campo 'senha' e obrigatorio.")
    String senha
) {}

