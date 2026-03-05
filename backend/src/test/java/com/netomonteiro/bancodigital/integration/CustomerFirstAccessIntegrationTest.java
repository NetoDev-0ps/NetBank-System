package com.netomonteiro.bancodigital.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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
        "spring.datasource.url=jdbc:h2:mem:testdb-first-access;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
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
class CustomerFirstAccessIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private Long clienteId;

    @BeforeEach
    void setup() {
        usuarioRepository.deleteAll();

        Usuario cliente = new Usuario();
        cliente.setNome("Cliente Primeiro Acesso");
        cliente.setCpf("98765432100");
        cliente.setTelefone("85911112222");
        cliente.setEmail("primeiro.acesso@netbank.com");
        cliente.setSenha(passwordEncoder.encode("Senha@123"));
        cliente.setStatus(StatusConta.ATIVA);
        cliente.setCargo("CLIENTE");
        cliente.setDataNascimento(LocalDate.of(1992, 5, 10));
        cliente.setPrimeiroLogin(true);
        cliente.setSaldo(BigDecimal.ZERO);

        clienteId = usuarioRepository.save(cliente).getId();
    }

    @Test
    void shouldReturnUpdatedUserAndApplyBonusOnlyOnce() throws IOException, InterruptedException {
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
              "tipoAcesso":"CLIENTE",
              "cpf":"98765432100",
              "email":"primeiro.acesso@netbank.com",
              "senha":"Senha@123"
            }
            """
        );
        assertEquals(200, loginResponse.statusCode());

        String authCookie = extractCookie(loginResponse, "NETBANK_AUTH");
        String xsrfCookie = extractCookie(loginResponse, "XSRF-TOKEN");
        assertNotNull(authCookie);

        CsrfContext csrfContext = fetchCsrfContext(client, baseUrl, authCookie, xsrfCookie);
        String cookies = authCookie + "; " + csrfContext.csrfCookie();

        HttpResponse<String> primeiroAcesso = send(
            client,
            "PATCH",
            baseUrl + "/usuarios/" + clienteId + "/primeiro-acesso-concluido",
            cookies,
            csrfContext.csrfToken(),
            null
        );
        assertEquals(200, primeiroAcesso.statusCode());

        JsonNode root = objectMapper.readTree(primeiroAcesso.body());
        JsonNode usuarioNode = root.get("usuario");
        assertNotNull(usuarioNode);
        assertFalse(usuarioNode.get("primeiroLogin").asBoolean());
        assertEquals(0, new BigDecimal("5000.00").compareTo(usuarioNode.get("saldo").decimalValue()));

        Usuario salvo = usuarioRepository.findById(clienteId).orElseThrow();
        assertFalse(Boolean.TRUE.equals(salvo.getPrimeiroLogin()));
        assertEquals(0, new BigDecimal("5000.00").compareTo(salvo.getSaldo()));

        HttpResponse<String> segundoAcesso = send(
            client,
            "PATCH",
            baseUrl + "/usuarios/" + clienteId + "/primeiro-acesso-concluido",
            cookies,
            csrfContext.csrfToken(),
            null
        );
        assertEquals(200, segundoAcesso.statusCode());

        Usuario salvoDepois = usuarioRepository.findById(clienteId).orElseThrow();
        assertEquals(0, new BigDecimal("5000.00").compareTo(salvoDepois.getSaldo()));
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





