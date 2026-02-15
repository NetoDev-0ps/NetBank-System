package com.netomonteiro.bancodigital.dto.response;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.netomonteiro.bancodigital.model.enums.StatusConta;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        String cpf,
        String telefone,
        BigDecimal saldo,
        StatusConta status,
        LocalDate dataNascimento,
        String cargo // <-- ESSA É A LINHA QUE APAGA A RED LINE
) {}