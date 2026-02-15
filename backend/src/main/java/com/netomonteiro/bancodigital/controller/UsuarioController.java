package com.netomonteiro.bancodigital.controller;

import com.netomonteiro.bancodigital.dto.response.UsuarioResponseDTO;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.service.UsuarioService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Constantes para resolver o aviso do SonarLint (S1192)
    private static final String CHAVE_ERRO = "erro";
    private static final String CHAVE_STATUS = "status";

    private UsuarioResponseDTO converterParaDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getCpf(),
            usuario.getTelefone(),       
            usuario.getSaldo(),
            usuario.getStatus(),
            usuario.getDataNascimento(), 
            usuario.getCargo() // CORREÇÃO ARQUITETURAL: Entrega o cargo ao Frontend
        );
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        List<UsuarioResponseDTO> usuariosSeguros = usuarioService.listarTodos()
            .stream()
            .map(this::converterParaDTO)
            .toList();

        return ResponseEntity.ok(usuariosSeguros);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.buscarPorId(id);
            return ResponseEntity.ok(converterParaDTO(usuario));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(CHAVE_ERRO, e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Object> criarUsuario(@Valid @RequestBody Usuario usuario) {
        try {
            Usuario novoUsuario = usuarioService.criar(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(converterParaDTO(novoUsuario));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(CHAVE_ERRO, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Object> loginCliente(@RequestBody Map<String, String> credenciais) {
        try {
            Usuario usuario = usuarioService.loginPorEmail(
                credenciais.get("email"),
                credenciais.get("senha")
            );
            return ResponseEntity.ok(converterParaDTO(usuario));
        } catch (RuntimeException e) { 
            // PREVENÇÃO DE ERRO 500: Captura falhas de negócio/auth e padroniza a saída
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(CHAVE_ERRO, "Acesso negado. Credenciais inválidas."));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> alterarStatus(@PathVariable Long id, @RequestBody Map<String, String> dados) {
        try {
            if (!dados.containsKey(CHAVE_STATUS) || dados.get(CHAVE_STATUS) == null) {
                return ResponseEntity.badRequest().body(Map.of(CHAVE_ERRO, "O campo 'status' é obrigatório."));
            }

            StatusConta novoStatus = StatusConta.valueOf(dados.get(CHAVE_STATUS).toUpperCase());
            usuarioService.atualizarStatus(id, novoStatus);

            return ResponseEntity.ok(Map.of(
                "mensagem", "Status atualizado com sucesso",
                "novoStatus", novoStatus
            ));
        } catch (IllegalArgumentException e) { 
            // CORREÇÃO SEMÂNTICA: Mensagem alinhada com os estados reais do banco
            return ResponseEntity.badRequest().body(Map.of(CHAVE_ERRO, "Status inválido. Utilize ATIVA, SUSPENSA, BLOQUEADA ou RECUSADA."));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(CHAVE_ERRO, e.getMessage()));
        }
    }

    @PatchMapping("/{id}/deposito")
    public ResponseEntity<Object> depositar(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            Object valorObj = dados.get("valor");
            if (valorObj == null) {
                return ResponseEntity.badRequest().body(Map.of(CHAVE_ERRO, "O campo 'valor' é obrigatório."));
            }

            BigDecimal valor = new BigDecimal(valorObj.toString());
            usuarioService.depositar(id, valor);

            return ResponseEntity.ok(Map.of("mensagem", "Depósito de R$ " + valor + " confirmado!"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(CHAVE_ERRO, "O valor informado é inválido."));
        } catch (EntityNotFoundException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(CHAVE_ERRO, "Erro no depósito: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletarUsuario(@PathVariable Long id) {
        try {
            usuarioService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(CHAVE_ERRO, e.getMessage()));
        }
    }
}