package com.netomonteiro.bancodigital.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UsuarioCriarRequest(
    @NotBlank(message = "O nome e obrigatorio")
    @Size(min = 5, message = "O nome deve conter pelo menos 5 caracteres.")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "O nome deve conter apenas letras e espacos.")
    String nome,

    @NotBlank(message = "CPF e obrigatorio")
    @Pattern(regexp = "^\\d{11}$", message = "O CPF deve conter exatamente 11 numeros.")
    String cpf,

    @NotBlank(message = "O telefone e obrigatorio")
    @Pattern(regexp = "^\\d{10,11}$", message = "O telefone deve conter 10 ou 11 numeros.")
    String telefone,

    @NotBlank(message = "O email e obrigatorio")
    @Email(message = "Insira um email valido")
    String email,

    @NotBlank(message = "Senha e obrigatoria")
    String senha,

    @NotNull(message = "Data de nascimento e obrigatoria")
    @Past(message = "A data de nascimento deve estar no passado.")
    LocalDate dataNascimento
) {}


