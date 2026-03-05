package com.netomonteiro.bancodigital.repository;

import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    Optional<Usuario> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByTelefone(String telefone);

    long countByStatus(StatusConta status);

    @Query(
        """
        select u from Usuario u
        where
            (:busca is null or :busca = '' or
             lower(u.nome) like lower(concat('%', :busca, '%')) or
             lower(u.email) like lower(concat('%', :busca, '%')) or
             u.cpf like concat('%', :busca, '%'))
            and (:incluirRecusadas = true or u.status <> com.netomonteiro.bancodigital.model.enums.StatusConta.RECUSADA)
        """
    )
    Page<Usuario> searchForManager(
        @Param("busca") String busca,
        @Param("incluirRecusadas") boolean incluirRecusadas,
        Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from Usuario u where u.id = :id")
    Optional<Usuario> findByIdForUpdate(@Param("id") Long id);
}
