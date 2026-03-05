package com.netomonteiro.bancodigital.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.netomonteiro.bancodigital.model.ChavePix;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.repository.ChavePixRepository;
import com.netomonteiro.bancodigital.repository.TransacaoRepository;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
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
        "spring.datasource.url=jdbc:h2:mem:testdb-pix-flow;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
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
        "auth.cookie.name=NETBANK_AUTH",
        "auth.cookie.secure=false",
        "auth.cookie.same-site=Lax",
        "auth.captcha.enabled=false"
    }
)
class PixFlowIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ChavePixRepository chavePixRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Long origemId;
    private Long destinoId;

    @BeforeEach
    void setup() {
        transacaoRepository.deleteAll();
        chavePixRepository.deleteAll();
        usuarioRepository.deleteAll();

        Usuario origem = new Usuario();
        origem.setNome("Cliente Origem Pix");
        origem.setCpf("11122233344");
        origem.setTelefone("85988887777");
        origem.setEmail("origem.pix@netbank.com");
        origem.setSenha(passwordEncoder.encode("Senha@123"));
        origem.setStatus(StatusConta.ATIVA);
        origem.setCargo("CLIENTE");
        origem.setDataNascimento(LocalDate.of(1991, 2, 20));
        origem.setPrimeiroLogin(false);
        origem.setSaldo(new BigDecimal("1000.00"));

        Usuario destino = new Usuario();
        destino.setNome("Cliente Destino Pix");
        destino.setCpf("99988877766");
        destino.setTelefone("85977776666");
        destino.setEmail("destino.pix@netbank.com");
        destino.setSenha(passwordEncoder.encode("Senha@123"));
        destino.setStatus(StatusConta.ATIVA);
        destino.setCargo("CLIENTE");
        destino.setDataNascimento(LocalDate.of(1993, 8, 12));
        destino.setPrimeiroLogin(false);
        destino.setSaldo(new BigDecimal("200.00"));

        origemId = usuarioRepository.save(origem).getId();
        destinoId = usuarioRepository.save(destino).getId();

        chavePixRepository.save(new ChavePix(null, "destino.pix@netbank.com", "EMAIL", destino));
    }

    @Test
    void shouldCompletePixFlowWithTypedContracts() throws IOException, InterruptedException {
        String baseUrl = "http://localhost:" + port;
        HttpClient client = HttpClient.newHttpClient();

        LoginContext loginContext = loginCliente(client, baseUrl);
        CsrfContext csrf = fetchCsrfContext(
            client,
            baseUrl,
            loginContext.authCookie(),
            loginContext.xsrfCookie()
        );

        String cookies = loginContext.authCookie() + "; " + csrf.csrfCookie();

        HttpResponse<String> statusInicial = send(
            client,
            "GET",
            baseUrl + "/pix/status/" + origemId,
            cookies,
            null,
            null,
            null
        );
        assertEquals(200, statusInicial.statusCode());
        JsonNode statusInicialBody = objectMapper.readTree(statusInicial.body());
        assertFalse(statusInicialBody.path("temSenha").asBoolean());
        assertFalse(statusInicialBody.path("temChaves").asBoolean());

        HttpResponse<String> configurarSenha = send(
            client,
            "POST",
            baseUrl + "/pix/configurar-senha",
            cookies,
            csrf.csrfToken(),
            null,
            """
            {
              "usuarioId": %d,
              "senha": "1234"
            }
            """.formatted(origemId)
        );
        assertEquals(200, configurarSenha.statusCode());
        assertEquals(
            "SENHA_CADASTRADA_COM_SUCESSO",
            objectMapper.readTree(configurarSenha.body()).path("status").asText()
        );

        HttpResponse<String> registrarChave = send(
            client,
            "POST",
            baseUrl + "/pix/registrar-chave",
            cookies,
            csrf.csrfToken(),
            null,
            """
            {
              "usuarioId": %d,
              "tipo": "EMAIL",
              "valor": "origem.pix@netbank.com"
            }
            """.formatted(origemId)
        );
        assertEquals(200, registrarChave.statusCode());
        assertEquals(
            "CHAVE_ATIVADA_COM_SUCESSO",
            objectMapper.readTree(registrarChave.body()).path("status").asText()
        );

        HttpResponse<String> statusFinal = send(
            client,
            "GET",
            baseUrl + "/pix/status/" + origemId,
            cookies,
            null,
            null,
            null
        );
        assertEquals(200, statusFinal.statusCode());
        JsonNode statusFinalBody = objectMapper.readTree(statusFinal.body());
        assertTrue(statusFinalBody.path("temSenha").asBoolean());
        assertTrue(statusFinalBody.path("temChaves").asBoolean());

        String chaveDestino = URLEncoder.encode("destino.pix@netbank.com", StandardCharsets.UTF_8);
        HttpResponse<String> preview = send(
            client,
            "GET",
            baseUrl + "/pix/preview/" + chaveDestino,
            cookies,
            null,
            null,
            null
        );
        assertEquals(200, preview.statusCode());
        JsonNode previewBody = objectMapper.readTree(preview.body());
        assertEquals("Cliente Destino Pix", previewBody.path("nome").asText());
        assertEquals(destinoId.longValue(), previewBody.path("idDestino").asLong());
        assertTrue(previewBody.path("cpfMascarado").asText().startsWith("***."));

        String idempotencyKey = "pix-test-idempotency-123";
        HttpResponse<String> transferencia = send(
            client,
            "POST",
            baseUrl + "/pix/transferir",
            cookies,
            csrf.csrfToken(),
            idempotencyKey,
            """
            {
              "idOrigem": %d,
              "idDestino": %d,
              "valor": 150.00,
              "senha": "1234"
            }
            """.formatted(origemId, destinoId)
        );
        assertEquals(200, transferencia.statusCode());
        JsonNode transferenciaBody = objectMapper.readTree(transferencia.body());
        assertEquals("SUCESSO", transferenciaBody.path("status").asText());
        assertFalse(transferenciaBody.path("idTransacao").asText().isBlank());

        HttpResponse<String> replay = send(
            client,
            "POST",
            baseUrl + "/pix/transferir",
            cookies,
            csrf.csrfToken(),
            idempotencyKey,
            """
            {
              "idOrigem": %d,
              "idDestino": %d,
              "valor": 150.00,
              "senha": "1234"
            }
            """.formatted(origemId, destinoId)
        );

        assertEquals(200, replay.statusCode());
        JsonNode replayBody = objectMapper.readTree(replay.body());
        assertEquals(
            transferenciaBody.path("idTransacao").asText(),
            replayBody.path("idTransacao").asText()
        );

        Usuario origemAtualizada = usuarioRepository.findById(origemId).orElseThrow();
        Usuario destinoAtualizado = usuarioRepository.findById(destinoId).orElseThrow();

        assertEquals(0, new BigDecimal("850.00").compareTo(origemAtualizada.getSaldo()));
        assertEquals(0, new BigDecimal("350.00").compareTo(destinoAtualizado.getSaldo()));
        assertEquals(1, transacaoRepository.count());
    }

    private LoginContext loginCliente(HttpClient client, String baseUrl) throws IOException, InterruptedException {
        HttpResponse<String> loginResponse = send(
            client,
            "POST",
            baseUrl + "/auth/login",
            null,
            null,
            null,
            """
            {
              "tipoAcesso":"CLIENTE",
              "cpf":"11122233344",
              "email":"origem.pix@netbank.com",
              "senha":"Senha@123"
            }
            """
        );

        assertEquals(200, loginResponse.statusCode());

        String authCookie = extractCookie(loginResponse, "NETBANK_AUTH");
        String xsrfCookie = extractCookie(loginResponse, "XSRF-TOKEN");

        assertNotNull(authCookie);

        return new LoginContext(authCookie, xsrfCookie);
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
            null,
            null
        );

        assertEquals(200, csrfResponse.statusCode());
        JsonNode body = objectMapper.readTree(csrfResponse.body());
        String csrfToken = body.path("token").asText();
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
        String idempotencyKey,
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

        if (idempotencyKey != null) {
            request.header("Idempotency-Key", idempotencyKey);
        }

        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private record LoginContext(String authCookie, String xsrfCookie) {}

    private record CsrfContext(String csrfToken, String csrfCookie) {}
}





