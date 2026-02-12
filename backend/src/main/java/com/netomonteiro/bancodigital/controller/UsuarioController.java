package com.netomonteiro.bancodigital.controller;

import com.netomonteiro.bancodigital.model.StatusConta;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.service.UsuarioService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor // Cria o construtor para injeção automática do Service
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<?> criarUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario novoUsuario = usuarioService.criar(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginCliente(@RequestBody Usuario dadosLogin) {
        try {
            // Delega toda a busca e validação de status para o Service
            Usuario usuario = usuarioService.login(dadosLogin.getCpf(), dadosLogin.getSenha());
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            // Retorna erro 401 (Não autorizado) ou 403 (Proibido) conforme a falha
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> alterarStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> dados
    ) {
        try {
            // Converte a String que vem do Front para o Enum StatusConta
            // No Controller:
            StatusConta novoStatus = StatusConta.valueOf(dados.get("status").toUpperCase());
            usuarioService.atualizarStatus(id, novoStatus);
            return ResponseEntity.ok().body(
                "{\"mensagem\": \"Status atualizado para " + novoStatus + "\"}"
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Status inválido.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/deposito")
    public ResponseEntity<?> depositar(
        @PathVariable Long id,
        @RequestBody Map<String, Object> dados
    ) {
        try {
            // Conversão segura de qualquer entrada numérica para BigDecimal
            BigDecimal valor = new BigDecimal(dados.get("valor").toString());
            usuarioService.depositar(id, valor);
            return ResponseEntity.ok().body("{\"mensagem\": \"Depósito realizado com sucesso!\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro no depósito: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarUsuario(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
