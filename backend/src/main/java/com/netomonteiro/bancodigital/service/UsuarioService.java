package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado."));
    }

    @Transactional
    public Usuario criar(Usuario usuario) {
        // Normalização de dados (Double Check)
        usuario.setCpf(usuario.getCpf().replaceAll("\\D", ""));
        if (usuario.getTelefone() != null) {
            usuario.setTelefone(usuario.getTelefone().replaceAll("\\D", ""));
        }

        // Validação de Duplicidade (Evita erro 500 no banco)
        if (usuarioRepository.existsByCpf(usuario.getCpf())) {
            throw new IllegalArgumentException("Este CPF já possui uma proposta em análise.");
        }

        // Regras Iniciais de Negócio
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuario.setSaldo(BigDecimal.ZERO);
        usuario.setStatus(StatusConta.PENDENTE);

        return usuarioRepository.save(usuario);
    }

    // ==========================================================
    // ENGENHARIA DE LOGIN COM REGRAS DE STATUS
    // ==========================================================
    public Usuario loginPorEmail(String email, String senha) {
    Usuario usuario = usuarioRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas."));

    // Validação de Máquina de Estados
    if (!usuario.getStatus().equals(StatusConta.ATIVA)) {
        throw new IllegalArgumentException("Conta sem permissão de acesso. Status: " + usuario.getStatus());
    }

    // Validação Criptográfica
    if (!passwordEncoder.matches(senha, usuario.getSenha())) {
        throw new IllegalArgumentException("Credenciais inválidas.");
    }

    return usuario;
}
    @Transactional
    public void atualizarStatus(Long id, StatusConta novoStatus) {
        Usuario usuario = buscarPorId(id);
        usuario.setStatus(novoStatus);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void depositar(Long id, BigDecimal valor) {
        if (valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do depósito deve ser maior que zero.");
        }
        Usuario usuario = buscarPorId(id);
        usuario.setSaldo(usuario.getSaldo().add(valor));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void deletar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuário não encontrado.");
        }
        usuarioRepository.deleteById(id);
    }
}