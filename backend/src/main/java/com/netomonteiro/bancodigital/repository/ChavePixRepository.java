package com.netomonteiro.bancodigital.repository;

import com.netomonteiro.bancodigital.model.ChavePix;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChavePixRepository extends JpaRepository<ChavePix, Long> {
    Optional<ChavePix> findByValor(String valor);

    boolean existsByValor(String valor);

    List<ChavePix> findByUsuarioId(Long usuarioId);

    long deleteByUsuarioId(Long usuarioId);
}
