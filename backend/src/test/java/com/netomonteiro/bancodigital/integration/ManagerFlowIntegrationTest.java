package com.netomonteiro.bancodigital.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.netomonteiro.bancodigital.model.AdminUser;
import com.netomonteiro.bancodigital.model.AuditLog;
import com.netomonteiro.bancodigital.model.ChavePix;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.repository.AdminUserRepository;
import com.netomonteiro.bancodigital.repository.AuditLogRepository;
import com.netomonteiro.bancodigital.repository.ChavePixRepository;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=validate",
                "spring.sql.init.mode=never",
        "spring.flyway.baseline-on-migrate=false",
        "spring.jpa.show-sql=false",
        "jwt.secret=test-jwt-secret-with-at-least-32-characters",
        "jwt.expiration-minutes=60",
        "jwt.issuer=test-suite",
        "admin.name=Administrador Teste",
        "admin.email=admin@netbank.com.br",
        "admin.senha-hash=$2a$10$7EqJtq98hPqEX7fNZaFWoOHiKq5M7pVQ89xDSHLVQQP4Jrped1I8.",
        "auth.cookie.name=NETBANK_AUTH",
        "auth.cookie.secure=false",
        "auth.cookie.same-site=Lax",
        "auth.captcha.enabled=false"
    }
)
class ManagerFlowIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ChavePixRepository chavePixRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Long clienteId;

    @BeforeEach
    void setup() {
        auditLogRepository.deleteAll();
        chavePixRepository.deleteAll();
        usuarioRepository.deleteAll();
        adminUserRepository.deleteAll();

        AdminUser gerente = new AdminUser();
        gerente.setNome("Administrador Teste");
        gerente.setEmail("admin@netbank.com.br");
        gerente.setSenhaHash(passwordEncoder.encode("password"));
        gerente.setAtivo(true);
        adminUserRepository.save(gerente);

        Usuario cliente = new Usuario();
        cliente.setNome("Cliente Fluxo Teste");
        cliente.setCpf("12345678901");
        cliente.setTelefone("85999998888");
        cliente.setEmail("cliente.fluxo@test.com");
        cliente.setSenha(passwordEncoder.encode("Senha@123"));
        cliente.setStatus(StatusConta.PENDENTE);
        cliente.setCargo("CLIENTE");
        cliente.setDataNascimento(LocalDate.of(1990, 1, 1));
        cliente.setPrimeiroLogin(false);

        Usuario clienteSalvo = usuarioRepository.save(cliente);
        clienteId = clienteSalvo.getId();

        chavePixRepository.save(new ChavePix(null, clienteSalvo.getEmail(), "EMAIL", clienteSalvo));
    }

    @Test
    void shouldExecuteManagerLifecycleWithAuditTrail() throws IOException, InterruptedException {
        String baseUrl = "http://localhost:" + port;
        HttpClient client = HttpClient.newHttpClient();

        HttpResponse<String> loginResponse = send(
            client,
            "POST",
            baseUrl + "/auth/login",
            null,
            null,
            """
            {
              "tipoAcesso":"GERENTE",
              "email":"admin@netbank.com.br",
              "senha":"password"
            }
            """
        );

        assertEquals(200, loginResponse.statusCode(), "login body: " + loginResponse.body());

        String authCookie = extractCookie(loginResponse, "NETBANK_AUTH");
        String xsrfCookie = extractCookie(loginResponse, "XSRF-TOKEN");
        assertNotNull(authCookie);

        CsrfContext csrfContext = fetchCsrfContext(client, baseUrl, authCookie, xsrfCookie);
        String cookies = authCookie + "; " + csrfContext.csrfCookie();

        HttpResponse<String> primeiroAcessoGerente = send(
            client,
            "PATCH",
            baseUrl + "/usuarios/" + clienteId + "/primeiro-acesso-concluido",
            cookies,
            csrfContext.csrfToken(),
            null
        );
        assertEquals(403, primeiroAcessoGerente.statusCode());
        assertTrue(primeiroAcessoGerente.body().contains("ACESSO_NEGADO"));

        HttpResponse<String> pixStatusComoGerente = send(
            client,
            "GET",
            baseUrl + "/pix/status/" + clienteId,
            cookies,
            null,
            null
        );
        assertEquals(403, pixStatusComoGerente.statusCode());
        assertTrue(pixStatusComoGerente.body().contains("ACESSO_NEGADO"));

        HttpResponse<String> aprovar = send(
            client,
            "PATCH",
            baseUrl + "/usuarios/" + clienteId + "/status",
            cookies,
            csrfContext.csrfToken(),
            "{\"status\":\"ATIVA\"}"
        );
        assertEquals(200, aprovar.statusCode());
        assertEquals(
            StatusConta.ATIVA,
            usuarioRepository.findById(clienteId).orElseThrow().getStatus()
        );

        HttpResponse<String> suspender = send(
            client,
            "PATCH",
            baseUrl + "/usuarios/" + clienteId + "/status",
            cookies,
            csrfContext.csrfToken(),
            "{\"status\":\"SUSPENSA\"}"
        );
        assertEquals(200, suspender.statusCode());
        assertEquals(
            StatusConta.SUSPENSA,
            usuarioRepository.findById(clienteId).orElseThrow().getStatus()
        );

        HttpResponse<String> bloquear = send(
            client,
            "PATCH",
            baseUrl + "/usuarios/" + clienteId + "/status",
            cookies,
            csrfContext.csrfToken(),
            "{\"status\":\"BLOQUEADA\"}"
        );
        assertEquals(200, bloquear.statusCode());
        assertEquals(
            StatusConta.BLOQUEADA,
            usuarioRepository.findById(clienteId).orElseThrow().getStatus()
        );

        HttpResponse<String> tentativaReativarBloqueada = send(
            client,
            "PATCH",
            baseUrl + "/usuarios/" + clienteId + "/status",
            cookies,
            csrfContext.csrfToken(),
            "{\"status\":\"ATIVA\"}"
        );
        assertEquals(400, tentativaReativarBloqueada.statusCode());
        assertTrue(tentativaReativarBloqueada.body().contains("TRANSICAO_STATUS_INVALIDA"));
        assertEquals(
            StatusConta.BLOQUEADA,
            usuarioRepository.findById(clienteId).orElseThrow().getStatus()
        );

        HttpResponse<String> excluir = send(
            client,
            "DELETE",
            baseUrl + "/usuarios/" + clienteId,
            cookies,
            csrfContext.csrfToken(),
            null
        );
        assertEquals(204, excluir.statusCode());
        assertFalse(usuarioRepository.existsById(clienteId));
        assertTrue(chavePixRepository.findByUsuarioId(clienteId).isEmpty());

        List<AuditLog> logs = auditLogRepository.findTop200ByOrderByCreatedAtDesc();
        assertTrue(logs.stream().anyMatch(log -> "LOGIN_GERENTE".equals(log.getAction())));
        assertTrue(logs.stream().anyMatch(log -> "ALTERAR_STATUS_USUARIO".equals(log.getAction())));
        assertTrue(logs.stream().anyMatch(log -> "EXCLUIR_USUARIO".equals(log.getAction())));
    }

    private CsrfContext fetchCsrfContext(
        HttpClient client,
        String baseUrl,
        String authCookie,
        String fallbackCsrfCookie
    ) throws IOException, InterruptedException {
        HttpResponse<String> csrfResponse = send(
            client,
            "GET",
            baseUrl + "/auth/csrf",
            authCookie,
            null,
            null
        );

        assertEquals(200, csrfResponse.statusCode());
        JsonNode csrfBody = objectMapper.readTree(csrfResponse.body());
        String csrfToken = csrfBody.path("token").asText();
        String csrfCookie = extractCookie(csrfResponse, "XSRF-TOKEN");

        if (csrfCookie == null || csrfCookie.isBlank()) {
            csrfCookie = fallbackCsrfCookie;
        }

        assertFalse(csrfToken.isBlank());
        assertNotNull(csrfCookie);
        return new CsrfContext(csrfToken, csrfCookie);
    }

    private String extractCookie(HttpResponse<String> response, String cookieName) {
        return response
            .headers()
            .allValues("Set-Cookie")
            .stream()
            .filter(value -> value.startsWith(cookieName + "="))
            .findFirst()
            .map(value -> value.split(";", 2)[0])
            .orElse(null);
    }

    private HttpResponse<String> send(
        HttpClient client,
        String method,
        String url,
        String cookie,
        String csrfToken,
        String json
    ) throws IOException, InterruptedException {
        HttpRequest.BodyPublisher body = json == null
            ? HttpRequest.BodyPublishers.noBody()
            : HttpRequest.BodyPublishers.ofString(json);

        HttpRequest.Builder request = HttpRequest
            .newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .method(method, body);

        if (cookie != null) {
            request.header("Cookie", cookie);
        }

        if (csrfToken != null) {
            request.header("X-XSRF-TOKEN", csrfToken);
        }

        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private record CsrfContext(String csrfToken, String csrfCookie) {}
}



