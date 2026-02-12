package com.netomonteiro.bancodigital.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Data // Gera Getters, Setters, toString, Equals e HashCode automaticamente
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "CPF é obrigatório")
    private String cpf;

    @Column(unique = true, nullable = false)
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    private String senha;

    @DecimalMin(value = "0.0", message = "O saldo não pode ser negativo")
    private BigDecimal saldo = BigDecimal.ZERO; // Valor padrão inicial

    @Enumerated(EnumType.STRING)
    private StatusConta status = StatusConta.PENDENTE;

    @NotNull(message = "Data de nascimento é obrigatória")
    private LocalDate dataNascimento;
}
