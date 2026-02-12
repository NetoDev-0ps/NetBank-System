package com.netomonteiro.bancodigital.repository;

import com.netomonteiro.bancodigital.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);

    // Método vital para performance: Busca indexada no banco
    Optional<Usuario> findByCpf(String cpf);
}
