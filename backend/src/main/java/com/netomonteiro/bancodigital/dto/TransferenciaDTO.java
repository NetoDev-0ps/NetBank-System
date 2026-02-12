package com.netomonteiro.bancodigital.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class TransferenciaDTO {

    @NotNull(message = "O ID de origem é obrigatório")
    private Long idOrigem;

    @NotNull(message = "O ID de destino é obrigatório")
    private Long idDestino;

    @NotNull(message = "O valor é obrigatório")
    @Positive(message = "O valor da transferência deve ser maior que zero") // <--- A MÁGICA AQUI
    private BigDecimal valor;
}
