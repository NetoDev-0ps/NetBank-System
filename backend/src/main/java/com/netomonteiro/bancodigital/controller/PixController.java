package com.netomonteiro.bancodigital.controller;

import com.netomonteiro.bancodigital.api.ApiErrorBodyFactory;
import com.netomonteiro.bancodigital.dto.request.PixConfigurarSenhaRequest;
import com.netomonteiro.bancodigital.dto.request.PixRegistrarChaveRequest;
import com.netomonteiro.bancodigital.dto.request.PixTransferirRequest;
import com.netomonteiro.bancodigital.dto.response.PixKeyResponseDTO;
import com.netomonteiro.bancodigital.dto.response.PixPreviewResponseDTO;
import com.netomonteiro.bancodigital.dto.response.PixStatusResponseDTO;
import com.netomonteiro.bancodigital.dto.response.PixTransferResponseDTO;
import com.netomonteiro.bancodigital.dto.response.StatusResponseDTO;
import com.netomonteiro.bancodigital.model.Transacao;
import com.netomonteiro.bancodigital.security.JwtPrincipal;
import com.netomonteiro.bancodigital.security.SecurityAccessHelper;
import com.netomonteiro.bancodigital.service.PixService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pix")
@RequiredArgsConstructor
public class PixController {

    private final PixService pixService;

    @PostMapping("/configurar-senha")
    public ResponseEntity<Object> configurarSenha(
        @Valid @RequestBody PixConfigurarSenhaRequest payload,
        @AuthenticationPrincipal JwtPrincipal principal,
        HttpServletRequest request
    ) {
        Long userId = payload.usuarioId();
        if (!SecurityAccessHelper.canAccessOwnCustomer(principal, userId)) {
            return accessDenied(request);
        }

        pixService.cadastrarSenhaPix(userId, payload.senha());
        return ResponseEntity.ok(new StatusResponseDTO("SENHA_CADASTRADA_COM_SUCESSO"));
    }

    @PostMapping("/registrar-chave")
    public ResponseEntity<Object> registrarChave(
        @Valid @RequestBody PixRegistrarChaveRequest payload,
        @AuthenticationPrincipal JwtPrincipal principal,
        HttpServletRequest request
    ) {
        Long userId = payload.usuarioId();
        if (!SecurityAccessHelper.canAccessOwnCustomer(principal, userId)) {
            return accessDenied(request);
        }

        pixService.registrarChave(userId, payload.tipo(), payload.valor());
        return ResponseEntity.ok(new StatusResponseDTO("CHAVE_ATIVADA_COM_SUCESSO"));
    }

    @GetMapping("/preview/{chave}")
    public ResponseEntity<Object> buscarDestinatario(
        @PathVariable String chave,
        @AuthenticationPrincipal JwtPrincipal principal,
        HttpServletRequest request
    ) {
        if (!SecurityAccessHelper.isCliente(principal)) {
            return accessDenied(request);
        }

        PixPreviewResponseDTO preview = pixService.buscarDadosDestino(chave);
        return ResponseEntity.ok(preview);
    }

    @PostMapping("/transferir")
    public ResponseEntity<Object> transferir(
        @Valid @RequestBody PixTransferirRequest payload,
        @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
        @AuthenticationPrincipal JwtPrincipal principal,
        HttpServletRequest request
    ) {
        Long idOrigem = payload.idOrigem();
        if (!SecurityAccessHelper.canAccessOwnCustomer(principal, idOrigem)) {
            return accessDenied(request);
        }

        Transacao transacao = pixService.transferir(
            idOrigem,
            payload.idDestino(),
            payload.valor(),
            payload.senha(),
            idempotencyKey
        );

        return ResponseEntity.ok(
            new PixTransferResponseDTO("SUCESSO", transacao.getId(), transacao.getDataHora())
        );
    }

    @GetMapping("/chaves/{usuarioId}")
    public ResponseEntity<Object> listarChaves(
        @PathVariable Long usuarioId,
        @AuthenticationPrincipal JwtPrincipal principal,
        HttpServletRequest request
    ) {
        if (!SecurityAccessHelper.canAccessOwnCustomer(principal, usuarioId)) {
            return accessDenied(request);
        }

        List<PixKeyResponseDTO> chaves = pixService.listarMinhasChaves(usuarioId);
        return ResponseEntity.ok(chaves);
    }

    @DeleteMapping("/chaves/{chaveId}")
    public ResponseEntity<Object> excluirChave(
        @PathVariable Long chaveId,
        @RequestParam Long usuarioId,
        @AuthenticationPrincipal JwtPrincipal principal,
        HttpServletRequest request
    ) {
        if (!SecurityAccessHelper.canAccessOwnCustomer(principal, usuarioId)) {
            return accessDenied(request);
        }

        pixService.excluirChave(chaveId, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{usuarioId}")
    public ResponseEntity<Object> verificarStatus(
        @PathVariable Long usuarioId,
        @AuthenticationPrincipal JwtPrincipal principal,
        HttpServletRequest request
    ) {
        if (!SecurityAccessHelper.canAccessOwnCustomer(principal, usuarioId)) {
            return accessDenied(request);
        }

        PixStatusResponseDTO status = pixService.verificarStatusPix(usuarioId);
        return ResponseEntity.ok(status);
    }

    private ResponseEntity<Object> accessDenied(HttpServletRequest request) {
        return ResponseEntity
            .status(403)
            .body(ApiErrorBodyFactory.build("ACESSO_NEGADO", request));
    }
}
