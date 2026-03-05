package com.netomonteiro.bancodigital.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.netomonteiro.bancodigital.model.AdminUser;
import com.netomonteiro.bancodigital.repository.AdminUserRepository;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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
        "spring.datasource.url=jdbc:h2:mem:testdb-auth-rate;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
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
        "auth.captcha.enabled=false",
        "auth.login-protection.enabled=true",
        "auth.login-protection.max-attempts=3",
        "auth.login-protection.attempt-window-minutes=15",
        "auth.login-protection.lock-minutes=15"
    }
)
class AuthBruteForceIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        adminUserRepository.deleteAll();

        AdminUser gerente = new AdminUser();
        gerente.setNome("Admin Rate Limit");
        gerente.setEmail("admin.rate@test.com");
        gerente.setSenhaHash(passwordEncoder.encode("Senha@Gerente123"));
        gerente.setAtivo(true);
        adminUserRepository.save(gerente);
    }

    @Test
    void shouldBlockLoginAfterConsecutiveFailures() throws IOException, InterruptedException {
        String baseUrl = "http://localhost:" + port;
        HttpClient client = HttpClient.newHttpClient();

        HttpResponse<String> tentativa1 = loginGerente(client, baseUrl, "senha_errada_1");
        assertEquals(400, tentativa1.statusCode());

        HttpResponse<String> tentativa2 = loginGerente(client, baseUrl, "senha_errada_2");
        assertEquals(400, tentativa2.statusCode());

        HttpResponse<String> tentativa3 = loginGerente(client, baseUrl, "senha_errada_3");
        assertEquals(400, tentativa3.statusCode());

        HttpResponse<String> tentativa4 = loginGerente(client, baseUrl, "Senha@Gerente123");
        assertEquals(429, tentativa4.statusCode(), "body: " + tentativa4.body());
        assertTrue(tentativa4.body().contains("LOGIN_BLOQUEADO_TEMPORARIAMENTE"));
        assertTrue(tentativa4.headers().firstValue("Retry-After").isPresent());
    }

    private HttpResponse<String> loginGerente(HttpClient client, String baseUrl, String senha)
        throws IOException, InterruptedException {
        String json = """
            {
              "tipoAcesso":"GERENTE",
              "email":"admin.rate@test.com",
              "senha":"%s"
            }
            """.formatted(senha);

        HttpRequest request = HttpRequest
            .newBuilder()
            .uri(URI.create(baseUrl + "/auth/login"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}





