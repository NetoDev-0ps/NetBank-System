package com.netomonteiro.bancodigital.controller;

import com.netomonteiro.bancodigital.config.AuthCookieProperties;
import com.netomonteiro.bancodigital.config.JwtProperties;
import com.netomonteiro.bancodigital.dto.request.CaptchaVerifyRequest;
import com.netomonteiro.bancodigital.dto.request.UsuarioLoginRequest;
import com.netomonteiro.bancodigital.dto.response.CaptchaChallengeResponse;
import com.netomonteiro.bancodigital.dto.response.CaptchaVerifyResponse;
import com.netomonteiro.bancodigital.dto.response.UsuarioResponseDTO;
import com.netomonteiro.bancodigital.model.AdminUser;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.security.ClientIpResolver;
import com.netomonteiro.bancodigital.security.HumanCaptchaService;
import com.netomonteiro.bancodigital.security.JwtPrincipal;
import com.netomonteiro.bancodigital.security.JwtService;
import com.netomonteiro.bancodigital.security.LoginAttemptService;
import com.netomonteiro.bancodigital.security.SecurityAccessHelper;
import com.netomonteiro.bancodigital.service.AuditService;
import com.netomonteiro.bancodigital.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthCookieProperties authCookieProperties;
    private final AuditService auditService;
    private final LoginAttemptService loginAttemptService;
    private final HumanCaptchaService humanCaptchaService;

    @GetMapping("/captcha/challenge")
    public ResponseEntity<CaptchaChallengeResponse> challengeCaptcha() {
        return ResponseEntity.ok(humanCaptchaService.issueChallenge());
    }

    @PostMapping("/captcha/verify")
    public ResponseEntity<CaptchaVerifyResponse> verifyCaptcha(
        @Valid @RequestBody CaptchaVerifyRequest request,
        HttpServletRequest httpRequest
    ) {
        String clientIp = ClientIpResolver.resolve(httpRequest);
        CaptchaVerifyResponse response = humanCaptchaService.verifyChallenge(
            request.challengeToken(),
            request.sliderValue(),
            clientIp
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(
        @Valid @RequestBody UsuarioLoginRequest credenciais,
        HttpServletRequest request
    ) {
        humanCaptchaService.consumeProof(
            request.getHeader("X-Captcha-Proof"),
            ClientIpResolver.resolve(request)
        );

        String tipoAcesso = normalizeAccessType(credenciais.tipoAcesso());

        if (!"GERENTE".equals(tipoAcesso) && !"CLIENTE".equals(tipoAcesso)) {
            throw new IllegalArgumentException("TIPO_ACESSO_INVALIDO");
        }

        String loginKey = buildLoginKey(tipoAcesso, credenciais, request);
        loginAttemptService.assertNotBlocked(loginKey);

        UsuarioResponseDTO dto;
        Long actorId;
        String actorEmail;
        String actorRole;

        try {
            if ("GERENTE".equals(tipoAcesso)) {
                AdminUser gerente = usuarioService.loginGerente(normalizeEmail(credenciais.email()), credenciais.senha());
                dto = converterGerenteParaDTO(gerente);
                actorId = gerente.getId();
                actorEmail = gerente.getEmail();
                actorRole = "GERENTE";
            } else {
                Usuario cliente = usuarioService.loginCliente(
                    normalizeCpf(credenciais.cpf()),
                    normalizeEmail(credenciais.email()),
                    credenciais.senha()
                );
                dto = converterClienteParaDTO(cliente);
                actorId = cliente.getId();
                actorEmail = cliente.getEmail();
                actorRole = "CLIENTE";
            }
        } catch (IllegalArgumentException ex) {
            loginAttemptService.registerFailure(loginKey);
            throw ex;
        }

        loginAttemptService.registerSuccess(loginKey);

        String token = jwtService.generateToken(actorId, actorEmail, actorRole);

        if ("GERENTE".equals(actorRole)) {
            auditService.registrar(
                actorId,
                actorEmail,
                actorRole,
                "LOGIN_GERENTE",
                "AUTH",
                String.valueOf(actorId),
                "Login administrativo realizado com sucesso"
            );
        }

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token).toString())
            .body(Map.of("usuario", dto));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, buildDeleteCookie().toString())
            .build();
    }

    @GetMapping("/csrf")
    public ResponseEntity<Object> csrf(CsrfToken csrfToken) {
        ResponseCookie csrfCookie = ResponseCookie.from("XSRF-TOKEN", csrfToken.getToken())
            .httpOnly(false)
            .secure(authCookieProperties.isSecure())
            .sameSite(authCookieProperties.getSameSite())
            .path(authCookieProperties.getPath())
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, csrfCookie.toString())
            .body(
                Map.of(
                    "token", csrfToken.getToken(),
                    "headerName", csrfToken.getHeaderName(),
                    "parameterName", csrfToken.getParameterName()
                )
            );
    }

    @GetMapping("/me")
    public ResponseEntity<Object> me(@AuthenticationPrincipal JwtPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("erro", "NAO_AUTENTICADO"));
        }

        if (SecurityAccessHelper.isGerente(principal)) {
            AdminUser gerente = usuarioService.buscarGerentePorId(principal.userId());
            return ResponseEntity.ok(Map.of("usuario", converterGerenteParaDTO(gerente)));
        }

        Usuario cliente = usuarioService.buscarPorId(principal.userId());
        return ResponseEntity.ok(Map.of("usuario", converterClienteParaDTO(cliente)));
    }

    private String buildLoginKey(
        String tipoAcesso,
        UsuarioLoginRequest credenciais,
        HttpServletRequest request
    ) {
        String identifier = "GERENTE".equals(tipoAcesso)
            ? normalizeEmail(credenciais.email())
            : normalizeCpf(credenciais.cpf()) + "|" + normalizeEmail(credenciais.email());

        return tipoAcesso + "|" + identifier + "|" + ClientIpResolver.resolve(request);
    }

    private String normalizeAccessType(String tipoAcesso) {
        return tipoAcesso == null ? "" : tipoAcesso.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeCpf(String cpf) {
        return cpf == null ? "" : cpf.replaceAll("\\D", "");
    }

    private UsuarioResponseDTO converterClienteParaDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getCpf(),
            usuario.getTelefone(),
            usuario.getSaldo(),
            usuario.getStatus(),
            usuario.getDataNascimento(),
            usuario.getCargo(),
            Boolean.TRUE.equals(usuario.getPrimeiroLogin())
        );
    }

    private UsuarioResponseDTO converterGerenteParaDTO(AdminUser gerente) {
        return new UsuarioResponseDTO(
            gerente.getId(),
            gerente.getNome(),
            gerente.getEmail(),
            null,
            null,
            BigDecimal.ZERO,
            StatusConta.ATIVA,
            null,
            "GERENTE",
            false
        );
    }

    private ResponseCookie buildAuthCookie(String token) {
        return ResponseCookie.from(authCookieProperties.getName(), token)
            .httpOnly(true)
            .secure(authCookieProperties.isSecure())
            .sameSite(authCookieProperties.getSameSite())
            .path(authCookieProperties.getPath())
            .maxAge(Duration.ofMinutes(jwtProperties.getExpirationMinutes()))
            .build();
    }

    private ResponseCookie buildDeleteCookie() {
        return ResponseCookie.from(authCookieProperties.getName(), "")
            .httpOnly(true)
            .secure(authCookieProperties.isSecure())
            .sameSite(authCookieProperties.getSameSite())
            .path(authCookieProperties.getPath())
            .maxAge(Duration.ZERO)
            .build();
    }
}
