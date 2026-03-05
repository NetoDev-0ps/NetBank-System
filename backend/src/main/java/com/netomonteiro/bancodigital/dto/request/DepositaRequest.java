package com.netomonteiro.bancodigital.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record DepositaRequest(
    @NotNull(message = "O campo 'valor' e obrigatorio.")
    @DecimalMin(value = "0.01", message = "O valor do deposito deve ser maior que zero.")
    BigDecimal valor
) {}

