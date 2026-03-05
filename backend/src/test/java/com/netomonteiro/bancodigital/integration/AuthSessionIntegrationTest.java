package com.netomonteiro.bancodigital.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
        "spring.datasource.url=jdbc:h2:mem:testdb-auth-session;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
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
class AuthSessionIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        usuarioRepository.deleteAll();

        Usuario cliente = new Usuario();
        cliente.setNome("Cliente Sessao");
        cliente.setCpf("12345678901");
        cliente.setTelefone("85999998888");
        cliente.setEmail("cliente.sessao@test.com");
        cliente.setSenha(passwordEncoder.encode("Senha@123"));
        cliente.setStatus(StatusConta.ATIVA);
        cliente.setCargo("CLIENTE");
        cliente.setDataNascimento(LocalDate.of(1995, 10, 21));
        cliente.setPrimeiroLogin(false);
        usuarioRepository.save(cliente);
    }

    @Test
    void shouldLoginResolveSessionAndLogout() throws IOException, InterruptedException {
        String baseUrl = "http://localhost:" + port;
        HttpClient client = HttpClient.newHttpClient();

        HttpResponse<String> login = send(
            client,
            "POST",
            baseUrl + "/auth/login",
            null,
            """
            {
              "tipoAcesso":"CLIENTE",
              "cpf":"123.456.789-01",
              "email":"cliente.sessao@test.com",
              "senha":"Senha@123"
            }
            """
        );

        assertEquals(200, login.statusCode(), "login body: " + login.body());

        String authCookie = extractCookie(login, "NETBANK_AUTH");
        assertNotNull(authCookie);

        HttpResponse<String> me = send(client, "GET", baseUrl + "/auth/me", authCookie, null);
        assertEquals(200, me.statusCode(), "me body: " + me.body());
        assertTrue(me.body().contains("\"cargo\":\"CLIENTE\""));

        HttpResponse<String> logout = send(client, "POST", baseUrl + "/auth/logout", authCookie, null);
        assertEquals(204, logout.statusCode());

        boolean hasDeleteCookie = logout
            .headers()
            .allValues("Set-Cookie")
            .stream()
            .anyMatch(value -> value.startsWith("NETBANK_AUTH=") && value.contains("Max-Age=0"));
        assertTrue(hasDeleteCookie);

        HttpResponse<String> meAfterLogout = send(client, "GET", baseUrl + "/auth/me", null, null);
        assertEquals(401, meAfterLogout.statusCode());
        assertTrue(meAfterLogout.body().contains("NAO_AUTENTICADO"));
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

        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
}





