package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PixService {

    private final UsuarioRepository usuarioRepository;

    @Transactional // Garante que se um 'save' falhar, o outro sofre rollback
    public void transferirPorCpf(String cpfRemetente, String chaveDestino, BigDecimal valor) {
        if (valor.compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Valor inválido.");

        Usuario remetente = usuarioRepository
            .findByCpf(cpfRemetente)
            .orElseThrow(() -> new RuntimeException("Remetente não encontrado."));
        Usuario destinatario = usuarioRepository
            .findByCpf(chaveDestino)
            .orElseThrow(() -> new RuntimeException("Destinatário não encontrado."));

        if (remetente.getId().equals(destinatario.getId())) throw new RuntimeException(
            "Operação inválida."
        );

        // Comparação de saldo: (remetente < valor)
        if (remetente.getSaldo().compareTo(valor) < 0) throw new RuntimeException(
            "Saldo insuficiente."
        );

        // Aritmética Precisa
        remetente.setSaldo(remetente.getSaldo().subtract(valor));
        destinatario.setSaldo(destinatario.getSaldo().add(valor));

        usuarioRepository.save(remetente);
        usuarioRepository.save(destinatario);
    }
}
