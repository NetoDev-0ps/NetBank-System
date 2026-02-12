package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.model.StatusConta;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor // Gera o construtor para o 'final usuarioRepository' automaticamente
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @Transactional
    public Usuario criar(Usuario usuario) {
        if (usuarioRepository.existsByCpf(usuario.getCpf())) {
            throw new RuntimeException("Erro: CPF já cadastrado.");
        }
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("Erro: Email já em uso.");
        }

        // Validação de Maioridade
        if (usuario.getDataNascimento() != null) {
            int idade = Period.between(usuario.getDataNascimento(), LocalDate.now()).getYears();
            if (idade < 18) {
                throw new RuntimeException("Erro: Apenas maiores de 18 anos.");
            }
        }

        usuario.setStatus(StatusConta.PENDENTE);
        usuario.setSaldo(BigDecimal.ZERO); // Inicializa com zero usando BigDecimal
        return usuarioRepository.save(usuario);
    }

    public Usuario login(String cpf, String senha) {
        // Busca indexada por CPF (Lógica O(1) no banco)
        Usuario usuario = usuarioRepository
            .findByCpf(cpf.replaceAll("\\D", ""))
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        if (!usuario.getSenha().equals(senha)) {
            throw new RuntimeException("Senha incorreta.");
        }

        // Validação de Status usando o Enum
        if (usuario.getStatus() == StatusConta.PENDENTE) {
            throw new RuntimeException("Conta em análise. Aguarde a aprovação.");
        }
        if (usuario.getStatus() != StatusConta.ATIVA) {
            throw new RuntimeException(
                "Conta com status: " + usuario.getStatus() + ". Acesso negado."
            );
        }

        return usuario;
    }

    @Transactional
    public void depositar(Long id, BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor do depósito deve ser positivo.");
        }

        Usuario usuario = usuarioRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        usuario.setSaldo(usuario.getSaldo().add(valor));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void atualizarStatus(Long id, StatusConta novoStatus) {
        Usuario usuario = usuarioRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        usuario.setStatus(novoStatus);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void deletar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado.");
        }
        usuarioRepository.deleteById(id);
    }
}
