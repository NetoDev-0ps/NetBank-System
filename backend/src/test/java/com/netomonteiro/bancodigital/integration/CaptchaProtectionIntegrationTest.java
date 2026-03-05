package com.netomonteiro.bancodigital.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import java.io.IOException;
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
        "spring.datasource.url=jdbc:h2:mem:testdb-captcha;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
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
        "auth.captcha.enabled=true"
    }
)
class CaptchaProtectionIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        usuarioRepository.deleteAll();

        Usuario usuario = new Usuario();
        usuario.setNome("Cliente Captcha");
        usuario.setCpf("12312312312");
        usuario.setTelefone("85999990000");
        usuario.setEmail("cliente.captcha@netbank.com");
        usuario.setSenha(passwordEncoder.encode("Senha@123"));
        usuario.setStatus(StatusConta.ATIVA);
        usuario.setCargo("CLIENTE");
        usuario.setDataNascimento(LocalDate.of(1994, 4, 15));
        usuario.setPrimeiroLogin(false);
        usuarioRepository.save(usuario);
    }

    @Test
    void shouldEnforceCaptchaProofForLoginAndRejectReplay() throws IOException, InterruptedException {
        String baseUrl = "http://localhost:" + port;
        HttpClient client = HttpClient.newHttpClient();

        HttpResponse<String> semCaptcha = send(
            client,
            "POST",
            baseUrl + "/auth/login",
            null,
            """
            {
              "tipoAcesso":"CLIENTE",
              "cpf":"12312312312",
              "email":"cliente.captcha@netbank.com",
              "senha":"Senha@123"
            }
            """
        );

        assertEquals(400, semCaptcha.statusCode());
        assertTrue(semCaptcha.body().contains("CAPTCHA_PROOF_AUSENTE"));

        String proofToken = resolveProofToken(client, baseUrl);

        HttpResponse<String> comCaptcha = send(
            client,
            "POST",
            baseUrl + "/auth/login",
            proofToken,
            """
            {
              "tipoAcesso":"CLIENTE",
              "cpf":"12312312312",
              "email":"cliente.captcha@netbank.com",
              "senha":"Senha@123"
            }
            """
        );

        assertEquals(200, comCaptcha.statusCode(), "login body: " + comCaptcha.body());
        assertNotNull(extractCookie(comCaptcha, "NETBANK_AUTH"));

        HttpResponse<String> replay = send(
            client,
            "POST",
            baseUrl + "/auth/login",
            proofToken,
            """
            {
              "tipoAcesso":"CLIENTE",
              "cpf":"12312312312",
              "email":"cliente.captcha@netbank.com",
              "senha":"Senha@123"
            }
            """
        );

        assertEquals(400, replay.statusCode());
        assertTrue(replay.body().contains("CAPTCHA_PROOF_REUTILIZADO"));
    }

    @Test
    void shouldRequireCaptchaProofForPublicRegistration() throws IOException, InterruptedException {
        String baseUrl = "http://localhost:" + port;
        HttpClient client = HttpClient.newHttpClient();

        String createPayload = """
            {
              "nome":"Cliente Novo",
              "cpf":"99988877766",
              "telefone":"85988887777",
              "email":"novo.captcha@netbank.com",
              "senha":"Senha@123",
              "dataNascimento":"1996-08-10"
            }
            """;

        HttpResponse<String> semCaptcha = send(
            client,
            "POST",
            baseUrl + "/usuarios",
            null,
            createPayload
        );
        assertEquals(400, semCaptcha.statusCode());
        assertTrue(semCaptcha.body().contains("CAPTCHA_PROOF_AUSENTE"));

        String proofToken = resolveProofToken(client, baseUrl);

        HttpResponse<String> comCaptcha = send(
            client,
            "POST",
            baseUrl + "/usuarios",
            proofToken,
            createPayload
        );

        assertEquals(201, comCaptcha.statusCode(), "create body: " + comCaptcha.body());
        assertTrue(comCaptcha.body().contains("novo.captcha@netbank.com"));
    }

    private String resolveProofToken(HttpClient client, String baseUrl)
        throws IOException, InterruptedException {
        HttpResponse<String> challengeResponse = send(client, "GET", baseUrl + "/auth/captcha/challenge", null, null);
        assertEquals(200, challengeResponse.statusCode());

        JsonNode challengeBody = objectMapper.readTree(challengeResponse.body());
        String challengeToken = challengeBody.path("challengeToken").asText();
        int target = challengeBody.path("target").asInt();

        HttpResponse<String> verifyResponse = send(
            client,
            "POST",
            baseUrl + "/auth/captcha/verify",
            null,
            """
            {
              "challengeToken":"%s",
              "sliderValue": %d
            }
            """.formatted(challengeToken, target)
        );

        assertEquals(200, verifyResponse.statusCode(), "verify body: " + verifyResponse.body());

        JsonNode verifyBody = objectMapper.readTree(verifyResponse.body());
        String proofToken = verifyBody.path("proofToken").asText();
        assertFalse(proofToken.isBlank());

        return proofToken;
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
        String captchaProof,
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

        if (captchaProof != null && !captchaProof.isBlank()) {
            request.header("X-Captcha-Proof", captchaProof);
        }

        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
}





