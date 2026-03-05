package com.netomonteiro.bancodigital.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome e obrigatorio")
    @Size(min = 5, message = "O nome deve conter pelo menos 5 caracteres.")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "O nome deve conter apenas letras e espacos.")
    private String nome;

    @Column(unique = true, nullable = false, length = 11)
    @NotBlank(message = "CPF e obrigatorio")
    @Pattern(regexp = "^\\d{11}$", message = "O CPF deve conter exatamente 11 numeros.")
    private String cpf;

    @Column(unique = true, nullable = false, length = 15)
    @NotBlank(message = "O telefone e obrigatorio")
    @Pattern(
        regexp = "^\\d{10,11}$",
        message = "O telefone deve conter apenas os 10 ou 11 numeros (com DDD)."
    )
    private String telefone;

    @NotBlank(message = "O email e obrigatorio")
    @Email(message = "Insira um email valido")
    @Column(nullable = false)
    private String email;

    @NotBlank(message = "Senha e obrigatoria")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String senha;

    @Column(name = "cargo", nullable = false)
    private String cargo = "CLIENTE";

    @DecimalMin(value = "0.0", message = "O saldo nao pode ser negativo")
    @Column(nullable = false)
    private BigDecimal saldo = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusConta status = StatusConta.PENDENTE;

    @NotNull(message = "Data de nascimento e obrigatoria")
    @Past(message = "A data de nascimento deve estar no passado.")
    private LocalDate dataNascimento;

    @Column(name = "is_primeiro_login", nullable = false)
    private Boolean primeiroLogin = true;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "senha_pix")
    private String senhaPix;
}