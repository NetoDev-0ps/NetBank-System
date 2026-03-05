package com.netomonteiro.bancodigital.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UsuarioLoginRequest(
    String cpf,
    @NotBlank(message = "TIPO_ACESSO_OBRIGATORIO")
    @Pattern(regexp = "^(?i)(CLIENTE|GERENTE)$", message = "TIPO_ACESSO_INVALIDO")
    String tipoAcesso,
    @NotBlank(message = "O campo 'email' e obrigatorio.")
    @Email(message = "O campo 'email' precisa ser valido.")
    String email,
    @NotBlank(message = "O campo 'senha' e obrigatorio.")
    String senha
) {}