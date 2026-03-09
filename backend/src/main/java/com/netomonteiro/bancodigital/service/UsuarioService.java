package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.dto.response.UsuarioPageResponseDTO;
import com.netomonteiro.bancodigital.dto.response.UsuarioResponseDTO;
import com.netomonteiro.bancodigital.dto.response.UsuarioStatsResponseDTO;
import com.netomonteiro.bancodigital.model.AdminUser;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.repository.AdminUserRepository;
import com.netomonteiro.bancodigital.repository.ChavePixRepository;
import com.netomonteiro.bancodigital.repository.TransacaoRepository;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AdminUserRepository adminUserRepository;
    private final ChavePixRepository chavePixRepository;
    private final TransacaoRepository transacaoRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UsuarioNormalizationService normalizationService;
    private final UsuarioMapper usuarioMapper;
    private final UsuarioStatusPolicy statusPolicy;
    private final BrazilPhoneValidator brazilPhoneValidator;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public UsuarioPageResponseDTO listarPaginado(
        String busca,
        int page,
        int size,
        boolean incluirRecusadas
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);

        Page<Usuario> usuariosPage = usuarioRepository.searchForManager(
            normalizationService.normalizarBusca(busca),
            incluirRecusadas,
            PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"))
        );

        long ativos = usuarioRepository.countByStatus(StatusConta.ATIVA);
        long pendentes = usuarioRepository.countByStatus(StatusConta.PENDENTE);
        long suspensas = usuarioRepository.countByStatus(StatusConta.SUSPENSA);
        long bloqueadas = usuarioRepository.countByStatus(StatusConta.BLOQUEADA);
        long encerradas = usuarioRepository.countByStatus(StatusConta.ENCERRADA);
        long recusadas = usuarioRepository.countByStatus(StatusConta.RECUSADA);
        long total = incluirRecusadas
            ? ativos + pendentes + suspensas + bloqueadas + encerradas + recusadas
            : ativos + pendentes + suspensas + bloqueadas + encerradas;

        return new UsuarioPageResponseDTO(
            usuariosPage.getContent().stream().map(this::toDto).toList(),
            usuariosPage.getNumber(),
            usuariosPage.getSize(),
            usuariosPage.getTotalElements(),
            usuariosPage.getTotalPages(),
            new UsuarioStatsResponseDTO(
                total,
                ativos,
                pendentes,
                suspensas,
                bloqueadas,
                encerradas,
                recusadas
            )
        );
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado."));
    }

    public AdminUser buscarGerentePorId(Long id) {
        return adminUserRepository
            .findByIdAndAtivoTrue(id)
            .orElseThrow(() -> new EntityNotFoundException("Gerente nao encontrado."));
    }

    @Transactional
    public Usuario criar(Usuario usuario) {
        usuario.setCpf(normalizationService.normalizarCpf(usuario.getCpf()));
        usuario.setTelefone(normalizationService.normalizarTelefone(usuario.getTelefone()));
        usuario.setEmail(normalizationService.normalizarEmail(usuario.getEmail()));

        if (!brazilPhoneValidator.hasValidDdd(usuario.getTelefone())) {
            throw new IllegalArgumentException("TELEFONE_DDD_INVALIDO");
        }

        if (usuarioRepository.existsByCpf(usuario.getCpf())) {
            throw new IllegalArgumentException("CPF_JA_CADASTRADO");
        }
        if (usuarioRepository.existsByEmailIgnoreCase(usuario.getEmail())) {
            throw new IllegalArgumentException("EMAIL_JA_CADASTRADO");
        }
        if (usuarioRepository.existsByTelefone(usuario.getTelefone())) {
            throw new IllegalArgumentException("TELEFONE_JA_CADASTRADO");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuario.setSaldo(BigDecimal.ZERO);
        usuario.setStatus(StatusConta.PENDENTE);
        usuario.setCargo("CLIENTE");
        usuario.setPrimeiroLogin(true);

        return usuarioRepository.save(usuario);
    }

    public Usuario loginCliente(String cpf, String email, String senha) {
        if (cpf == null || cpf.isBlank()) {
            throw new IllegalArgumentException("CPF_OBRIGATORIO");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("EMAIL_OBRIGATORIO");
        }
        if (senha == null || senha.isBlank()) {
            throw new IllegalArgumentException("SENHA_OBRIGATORIA");
        }

        Usuario usuario = usuarioRepository
            .findByEmailIgnoreCase(normalizationService.normalizarEmail(email))
            .orElseThrow(() -> new IllegalArgumentException("EMAIL_NAO_ENCONTRADO"));

        if (!"CLIENTE".equalsIgnoreCase(usuario.getCargo())) {
            throw new IllegalArgumentException("TIPO_ACESSO_INVALIDO");
        }

        if (!usuario.getCpf().equals(normalizationService.normalizarCpf(cpf))) {
            throw new IllegalArgumentException("DADOS_DIVERGENTES");
        }

        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new IllegalArgumentException("SENHA_INCORRETA");
        }

        statusPolicy.validarLogin(usuario.getStatus());
        return usuario;
    }

    public AdminUser loginGerente(String email, String senha) {
        if (email == null || email.isBlank() || senha == null || senha.isBlank()) {
            throw new IllegalArgumentException("CREDENCIAIS_GERENTE_INVALIDAS");
        }

        AdminUser admin = adminUserRepository
            .findByEmailIgnoreCase(normalizationService.normalizarEmail(email))
            .orElseThrow(() -> new IllegalArgumentException("CREDENCIAIS_GERENTE_INVALIDAS"));

        if (!Boolean.TRUE.equals(admin.getAtivo())) {
            throw new IllegalArgumentException("GERENTE_INATIVO");
        }

        boolean senhaValida;
        try {
            senhaValida = passwordEncoder.matches(senha, admin.getSenhaHash());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("ADMIN_PASSWORD_HASH_INVALIDO");
        }

        if (!senhaValida) {
            throw new IllegalArgumentException("CREDENCIAIS_GERENTE_INVALIDAS");
        }

        return admin;
    }

    @Transactional
    public Usuario concluirPrimeiroAcesso(Long id) {
        Usuario usuario = buscarPorId(id);

        if (Boolean.TRUE.equals(usuario.getPrimeiroLogin())) {
            BigDecimal bonusBoasVindas = new BigDecimal("5000.00");
            usuario.setSaldo(usuario.getSaldo().add(bonusBoasVindas));
            usuario.setPrimeiroLogin(false);
            return usuarioRepository.save(usuario);
        }

        return usuario;
    }

    @Transactional
    public Usuario atualizarStatus(Long id, StatusConta novoStatus) {
        Usuario usuario = buscarPorId(id);

        if (usuario.getStatus() == novoStatus) {
            return usuario;
        }

        statusPolicy.validarTransicao(usuario.getStatus(), novoStatus);

        usuario.setStatus(novoStatus);
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void depositar(Long id, BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("VALOR_DEPOSITO_INVALIDO");
        }

        Usuario usuario = buscarPorId(id);
        usuario.setSaldo(usuario.getSaldo().add(valor));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void deletar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuario nao encontrado.");
        }

        chavePixRepository.deleteByUsuarioId(id);
        transacaoRepository.deleteByRemetenteIdOrDestinatarioId(id, id);
        usuarioRepository.deleteById(id);
    }

    public UsuarioResponseDTO toDto(Usuario usuario) {
        return usuarioMapper.toDto(usuario);
    }
}
