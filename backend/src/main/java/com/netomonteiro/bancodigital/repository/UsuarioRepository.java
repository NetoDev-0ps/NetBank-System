package com.netomonteiro.bancodigital.repository;

import com.netomonteiro.bancodigital.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Consultas de Autenticação e Busca Segura
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByCpf(String cpf);

    // Consultas de Alta Performance para Validação (Double Check)
    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
}