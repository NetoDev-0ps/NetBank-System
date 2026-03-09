package com.netomonteiro.bancodigital.controller;

import com.netomonteiro.bancodigital.api.ApiErrorBodyFactory;
import com.netomonteiro.bancodigital.dto.request.AlterarStatusRequest;
import com.netomonteiro.bancodigital.dto.request.DepositaRequest;
import com.netomonteiro.bancodigital.dto.request.UsuarioCriarRequest;
import com.netomonteiro.bancodigital.dto.response.UsuarioPageResponseDTO;
import com.netomonteiro.bancodigital.dto.response.UsuarioResponseDTO;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.security.ClientIpResolver;
import com.netomonteiro.bancodigital.security.HumanCaptchaService;
import com.netomonteiro.bancodigital.security.JwtPrincipal;
import com.netomonteiro.bancodigital.security.SecurityAccessHelper;
import com.netomonteiro.bancodigital.service.AuditService;
import com.netomonteiro.bancodigital.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuditService auditService;
    private final HumanCaptchaService humanCaptchaService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        List<UsuarioResponseDTO> usuariosSeguros = usuarioService
            .listarTodos()
            .stream()
            .map(usuarioService::toDto)
            .toList();

        return ResponseEntity.ok(usuariosSeguros);
    }

    @GetMapping("/paginado")
    public ResponseEntity<UsuarioPageResponseDTO> listarPaginado(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(required = false) String busca,
        @RequestParam(defaultValue = "false") boolean incluirRecusadas
    ) {
        UsuarioPageResponseDTO response = usuarioService.listarPaginado(
            busca,
            page,
            size,
            incluirRecusadas
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(
        @PathVariable Long id,
        @AuthenticationPrincipal JwtPrincipal principal,
        HttpServletRequest request
    ) {
        if (!SecurityAccessHelper.canAccessUser(principal, id)) {
            return accessDenied(request);
        }

        Usuario usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(usuarioService.toDto(usuario));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criarUsuario(
        @Valid @RequestBody UsuarioCriarRequest request,
        HttpServletRequest httpRequest
    ) {
        humanCaptchaService.consumeProof(
            httpRequest.getHeader("X-Captcha-Proof"),
            ClientIpResolver.resolve(httpRequest)
        );

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(request.nome());
        novoUsuario.setCpf(request.cpf());
        novoUsuario.setTelefone(request.telefone());
        novoUsuario.setEmail(request.email());
        novoUsuario.setSenha(request.senha());
        novoUsuario.setDataNascimento(request.dataNascimento());

        Usuario salvo = usuarioService.criar(novoUsuario);
        return ResponseEntity.status(201).body(usuarioService.toDto(salvo));
    }

    @PatchMapping("/{id}/primeiro-acesso-concluido")
    public ResponseEntity<Object> concluirPrimeiroAcesso(
        @PathVariable Long id,
        @AuthenticationPrincipal JwtPrincipal principal,
        HttpServletRequest request
    ) {
        if (!SecurityAccessHelper.canAccessOwnCustomer(principal, id)) {
            return accessDenied(request);
        }

        Usuario atualizado = usuarioService.concluirPrimeiroAcesso(id);
        return ResponseEntity.ok(Map.of("usuario", usuarioService.toDto(atualizado)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> alterarStatus(
        @PathVariable Long id,
        @Valid @RequestBody AlterarStatusRequest dados,
        @AuthenticationPrincipal JwtPrincipal principal
    ) {
        StatusConta novoStatus;
        try {
            novoStatus = StatusConta.valueOf(dados.status().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                "STATUS_INVALIDO. Utilize ATIVA, SUSPENSA, BLOQUEADA, ENCERRADA, PENDENTE ou RECUSADA."
            );
        }

        StatusConta statusAnterior = usuarioService.buscarPorId(id).getStatus();
        Usuario usuarioAtualizado = usuarioService.atualizarStatus(id, novoStatus);

        auditService.registrar(
            principal,
            resolveStatusAuditAction(statusAnterior, usuarioAtualizado.getStatus()),
            "USUARIO",
            String.valueOf(id),
            "Status: " + statusAnterior + " -> " + usuarioAtualizado.getStatus()
        );

        return ResponseEntity.ok(
            Map.of(
                "mensagem",
                "Status atualizado com sucesso",
                "novoStatus",
                usuarioAtualizado.getStatus()
            )
        );
    }

    @PatchMapping("/{id}/deposito")
    public ResponseEntity<Object> depositar(
        @PathVariable Long id,
        @Valid @RequestBody DepositaRequest dados,
        @AuthenticationPrincipal JwtPrincipal principal
    ) {
        usuarioService.depositar(id, dados.valor());
        auditService.registrar(
            principal,
            "DEPOSITO_USUARIO",
            "USUARIO",
            String.valueOf(id),
            "Deposito realizado no valor: " + dados.valor()
        );
        return ResponseEntity.ok(Map.of("mensagem", "Deposito confirmado."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletarUsuario(
        @PathVariable Long id,
        @AuthenticationPrincipal JwtPrincipal principal
    ) {
        usuarioService.deletar(id);
        auditService.registrar(
            principal,
            "EXCLUIR_USUARIO",
            "USUARIO",
            String.valueOf(id),
            "Exclusao definitiva do cadastro"
        );

        return ResponseEntity.noContent().build();
    }

    private String resolveStatusAuditAction(StatusConta anterior, StatusConta atual) {
        if (anterior == StatusConta.BLOQUEADA && atual == StatusConta.ATIVA) {
            return "REATIVAR_USUARIO_BLOQUEADO";
        }
        if (atual == StatusConta.BLOQUEADA) {
            return "BLOQUEAR_USUARIO";
        }
        if (atual == StatusConta.ENCERRADA) {
            return "ENCERRAR_CONTA_USUARIO";
        }
        if (atual == StatusConta.SUSPENSA) {
            return "SUSPENDER_USUARIO";
        }
        if (atual == StatusConta.ATIVA) {
            return "ATIVAR_USUARIO";
        }
        if (atual == StatusConta.RECUSADA) {
            return "RECUSAR_USUARIO";
        }
        return "ALTERAR_STATUS_USUARIO";
    }

    private ResponseEntity<Object> accessDenied(HttpServletRequest request) {
        return ResponseEntity
            .status(403)
            .body(ApiErrorBodyFactory.build("ACESSO_NEGADO", request));
    }
}
