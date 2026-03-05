package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.dto.response.PixKeyResponseDTO;
import com.netomonteiro.bancodigital.dto.response.PixPreviewResponseDTO;
import com.netomonteiro.bancodigital.dto.response.PixStatusResponseDTO;
import com.netomonteiro.bancodigital.model.ChavePix;
import com.netomonteiro.bancodigital.model.Transacao;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.repository.ChavePixRepository;
import com.netomonteiro.bancodigital.repository.TransacaoRepository;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PixService {

    private static final List<String> TIPOS_CHAVE_PERMITIDOS = List.of("CPF", "EMAIL", "TELEFONE");

    private final UsuarioRepository usuarioRepository;
    private final ChavePixRepository chavePixRepository;
    private final TransacaoRepository transacaoRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final PixKeyService pixKeyService;

    @Transactional
    public void cadastrarSenhaPix(Long usuarioId, String senhaQuatroDigitos) {
        Usuario usuario = usuarioRepository
            .findById(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("USUARIO_NAO_ENCONTRADO"));

        if (senhaQuatroDigitos == null || !senhaQuatroDigitos.trim().matches("\\d{4}")) {
            throw new IllegalArgumentException("SENHA_PIX_INVALIDA");
        }

        usuario.setSenhaPix(passwordEncoder.encode(senhaQuatroDigitos.trim()));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void registrarChave(Long usuarioId, String tipo, String valorSolicitado) {
        Usuario usuario = usuarioRepository
            .findById(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("USUARIO_NAO_ENCONTRADO"));

        String tipoNormalizado = pixKeyService.normalizarTipo(tipo);
        if (!TIPOS_CHAVE_PERMITIDOS.contains(tipoNormalizado)) {
            throw new IllegalArgumentException("TIPO_CHAVE_INVALIDO");
        }

        String valorNormalizado = pixKeyService.normalizarChave(tipoNormalizado, valorSolicitado);
        if (valorNormalizado == null || valorNormalizado.isBlank()) {
            throw new IllegalArgumentException("CHAVE_INVALIDA");
        }

        if (!pixKeyService.pertenceAoUsuario(usuario, tipoNormalizado, valorNormalizado)) {
            throw new IllegalArgumentException("DADOS_NAO_PERTENCEM_AO_USUARIO");
        }

        if (chavePixRepository.existsByValor(valorNormalizado)) {
            throw new IllegalArgumentException("CHAVE_JA_CADASTRADA_NO_SISTEMA");
        }

        ChavePix novaChave = new ChavePix(null, valorNormalizado, tipoNormalizado, usuario);
        chavePixRepository.save(novaChave);
    }

    @Transactional(readOnly = true)
    public PixPreviewResponseDTO buscarDadosDestino(String chave) {
        ChavePix chavePix = pixKeyService
            .buscarChavePorVariacoes(chave)
            .orElseThrow(() -> new IllegalArgumentException("CHAVE_NAO_ENCONTRADA"));

        Usuario destino = chavePix.getUsuario();
        String cpf = destino.getCpf();
        if (cpf == null || cpf.length() != 11) {
            throw new IllegalArgumentException("CPF_DESTINO_INVALIDO");
        }

        String cpfMascarado = "***." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-**";

        return new PixPreviewResponseDTO(destino.getNome(), cpfMascarado, destino.getId());
    }

    @Transactional
    public Transacao transferir(
        Long idOrigem,
        Long idDestino,
        BigDecimal valor,
        String senhaInformada,
        String idempotencyKey
    ) {
        if (idOrigem == null || idDestino == null) {
            throw new IllegalArgumentException("USUARIO_INVALIDO");
        }
        if (idOrigem.equals(idDestino)) {
            throw new IllegalArgumentException("TRANSFERENCIA_PARA_SI_MESMO_NAO_PERMITIDA");
        }
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("VALOR_INVALIDO");
        }
        if (senhaInformada == null || senhaInformada.isBlank()) {
            throw new IllegalArgumentException("SENHA_PIX_INCORRETA");
        }

        String normalizedIdempotencyKey = pixKeyService.normalizarIdempotencyKey(idempotencyKey);
        if (normalizedIdempotencyKey != null) {
            Optional<Transacao> existing = transacaoRepository.findByRemetenteIdAndIdempotencyKey(
                idOrigem,
                normalizedIdempotencyKey
            );

            if (existing.isPresent()) {
                Transacao replay = existing.get();
                boolean sameTarget = replay.getDestinatario().getId().equals(idDestino);
                boolean sameAmount = replay.getValor().compareTo(valor) == 0;

                if (!sameTarget || !sameAmount) {
                    throw new IllegalArgumentException("IDEMPOTENCY_KEY_EM_USO_COM_OUTRA_OPERACAO");
                }

                return replay;
            }
        }

        Long primeiroId = Math.min(idOrigem, idDestino);
        Long segundoId = Math.max(idOrigem, idDestino);

        Usuario primeiroUsuario = usuarioRepository
            .findByIdForUpdate(primeiroId)
            .orElseThrow(() -> new EntityNotFoundException("USUARIO_NAO_ENCONTRADO"));

        Usuario segundoUsuario = usuarioRepository
            .findByIdForUpdate(segundoId)
            .orElseThrow(() -> new EntityNotFoundException("USUARIO_NAO_ENCONTRADO"));

        Usuario remetente = idOrigem.equals(primeiroId) ? primeiroUsuario : segundoUsuario;
        Usuario destinatario = idDestino.equals(primeiroId) ? primeiroUsuario : segundoUsuario;

        if (remetente.getStatus() != StatusConta.ATIVA || destinatario.getStatus() != StatusConta.ATIVA) {
            throw new IllegalArgumentException("CONTA_NAO_ATIVA");
        }

        if (remetente.getSenhaPix() == null || remetente.getSenhaPix().isBlank()) {
            throw new IllegalArgumentException("SENHA_PIX_NAO_CADASTRADA");
        }

        if (!passwordEncoder.matches(senhaInformada.trim(), remetente.getSenhaPix())) {
            throw new IllegalArgumentException("SENHA_PIX_INCORRETA");
        }

        if (remetente.getSaldo().compareTo(valor) < 0) {
            throw new IllegalArgumentException("SALDO_INSUFICIENTE");
        }

        remetente.setSaldo(remetente.getSaldo().subtract(valor));
        destinatario.setSaldo(destinatario.getSaldo().add(valor));

        usuarioRepository.save(remetente);
        usuarioRepository.save(destinatario);

        Transacao transacao = new Transacao();
        transacao.setRemetente(remetente);
        transacao.setDestinatario(destinatario);
        transacao.setValor(valor);
        transacao.setDataHora(LocalDateTime.now());
        transacao.setTipo("PIX");
        transacao.setIdempotencyKey(normalizedIdempotencyKey);

        return transacaoRepository.save(transacao);
    }

    @Transactional(readOnly = true)
    public List<PixKeyResponseDTO> listarMinhasChaves(Long usuarioId) {
        return chavePixRepository
            .findByUsuarioId(usuarioId)
            .stream()
            .map(chave -> new PixKeyResponseDTO(chave.getId(), chave.getTipo(), chave.getValor()))
            .toList();
    }

    @Transactional
    public void excluirChave(Long chaveId, Long usuarioId) {
        ChavePix chave = chavePixRepository
            .findById(chaveId)
            .orElseThrow(() -> new IllegalArgumentException("CHAVE_NAO_ENCONTRADA"));

        if (!chave.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("OPERACAO_NAO_PERMITIDA");
        }

        chavePixRepository.delete(chave);
    }

    @Transactional(readOnly = true)
    public PixStatusResponseDTO verificarStatusPix(Long usuarioId) {
        Usuario usuario = usuarioRepository
            .findById(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("USUARIO_NAO_ENCONTRADO"));

        boolean temSenha = usuario.getSenhaPix() != null && !usuario.getSenhaPix().isBlank();
        boolean temChaves = !chavePixRepository.findByUsuarioId(usuarioId).isEmpty();

        return new PixStatusResponseDTO(temSenha, temChaves);
    }
}