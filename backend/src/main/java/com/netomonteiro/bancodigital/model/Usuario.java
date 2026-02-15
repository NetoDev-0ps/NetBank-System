package com.netomonteiro.bancodigital.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.netomonteiro.bancodigital.model.enums.StatusConta;

import lombok.*;

@Entity
@Table(name = "usuario") // Boa prática: garante o nome exato da tabela no SGBD
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 5, message = "O nome deve conter pelo menos 5 caracteres.")
    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O nome deve conter apenas letras e espaços.")
    private String nome;

    @Column(unique = true, nullable = false, length = 11)
    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "^\\d{11}$", message = "O CPF deve conter exatamente 11 números.")
    private String cpf;

    @Column(length = 15)
    @NotBlank(message = "O telefone é obrigatório")
    @Pattern(regexp = "^\\d{10,11}$", message = "O telefone deve conter apenas os 10 ou 11 números (com DDD).")
    private String telefone;

    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Insira um email válido")
    @Column(unique = true, nullable = false)
    // REMOVIDO: O regex restritivo. A anotação @Email já usa a especificação RFC segura.
    // Isso permite domínios como @netbank.com.br
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Column(nullable = false)
    private String senha;

    // NOVO CAMPO: O Motor do RBAC (Controle de Acesso)
    @Column(name = "cargo", nullable = false)
    private String cargo = "CLIENTE"; // Secure by Default: Se ninguém avisar, é cliente.

    @DecimalMin(value = "0.0", message = "O saldo não pode ser negativo")
    private BigDecimal saldo = BigDecimal.ZERO; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusConta status = StatusConta.PENDENTE;

    @NotNull(message = "Data de nascimento é obrigatória")
    @Past(message = "A data de nascimento deve estar no passado.") 
    private LocalDate dataNascimento;
}