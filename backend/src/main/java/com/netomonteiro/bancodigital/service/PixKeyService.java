package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.model.ChavePix;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.repository.ChavePixRepository;
import java.util.Locale;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PixKeyService {

    private final ChavePixRepository chavePixRepository;

    public Optional<ChavePix> buscarChavePorVariacoes(String chaveInformada) {
        if (chaveInformada == null || chaveInformada.isBlank()) {
            return Optional.empty();
        }

        String chaveOriginal = chaveInformada.trim();

        Optional<ChavePix> encontrada = chavePixRepository.findByValor(chaveOriginal);
        if (encontrada.isPresent()) {
            return encontrada;
        }

        String apenasDigitos = chaveOriginal.replaceAll("\\D", "");
        if (!apenasDigitos.isBlank() && !apenasDigitos.equals(chaveOriginal)) {
            encontrada = chavePixRepository.findByValor(apenasDigitos);
            if (encontrada.isPresent()) {
                return encontrada;
            }
        }

        String emailNormalizado = chaveOriginal.toLowerCase(Locale.ROOT);
        if (!emailNormalizado.equals(chaveOriginal)) {
            return chavePixRepository.findByValor(emailNormalizado);
        }

        return Optional.empty();
    }

    public String normalizarTipo(String tipo) {
        return tipo == null ? "" : tipo.trim().toUpperCase(Locale.ROOT);
    }

    public String normalizarChave(String tipo, String valor) {
        if (valor == null) {
            return null;
        }

        return switch (tipo) {
            case "CPF" -> valor.replaceAll("\\D", "");
            case "EMAIL" -> valor.trim().toLowerCase(Locale.ROOT);
            case "TELEFONE" -> valor.replaceAll("\\D", "");
            default -> valor.trim();
        };
    }

    public boolean pertenceAoUsuario(Usuario usuario, String tipo, String valorNormalizado) {
        return switch (tipo) {
            case "CPF" -> usuario.getCpf() != null && usuario.getCpf().equals(valorNormalizado);
            case "EMAIL" ->
                usuario.getEmail() != null && usuario.getEmail().equalsIgnoreCase(valorNormalizado);
            case "TELEFONE" ->
                usuario.getTelefone() != null && usuario.getTelefone().equals(valorNormalizado);
            default -> false;
        };
    }

    public String normalizarIdempotencyKey(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        if (normalized.isBlank()) {
            return null;
        }

        if (normalized.length() > 120) {
            throw new IllegalArgumentException("IDEMPOTENCY_KEY_INVALIDA");
        }

        return normalized;
    }
}