package com.netomonteiro.bancodigital.dto.response;

import com.netomonteiro.bancodigital.model.enums.StatusConta;
import java.math.BigDecimal;
import java.time.LocalDate;

public record UsuarioResponseDTO(
    Long id,
    String nome,
    String email,
    String cpf,
    String telefone,
    BigDecimal saldo,
    StatusConta status,
    LocalDate dataNascimento,
    String cargo,
    boolean primeiroLogin
) {}