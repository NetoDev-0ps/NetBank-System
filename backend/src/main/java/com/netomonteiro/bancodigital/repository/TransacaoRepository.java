package com.netomonteiro.bancodigital.repository;

import com.netomonteiro.bancodigital.model.Transacao;
import com.netomonteiro.bancodigital.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransacaoRepository extends JpaRepository<Transacao, String> {
    List<Transacao> findByRemetenteOrderByDataHoraDesc(Usuario remetente);

    Optional<Transacao> findByRemetenteIdAndIdempotencyKey(Long remetenteId, String idempotencyKey);

    long deleteByRemetenteIdOrDestinatarioId(Long remetenteId, Long destinatarioId);
}
