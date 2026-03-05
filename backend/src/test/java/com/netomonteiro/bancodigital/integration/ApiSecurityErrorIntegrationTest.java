package com.netomonteiro.bancodigital.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb-security-error;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
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
        "auth.cookie.same-site=Lax"
    }
)
class ApiSecurityErrorIntegrationTest {

    @LocalServerPort
    private int port;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void shouldReturnStructuredUnauthorizedBodyWithCorrelationId() throws IOException, InterruptedException {
        String baseUrl = "http://localhost:" + port;
        HttpClient client = HttpClient.newHttpClient();
        String correlationId = "test-correlation-id-401";

        HttpRequest request = HttpRequest
            .newBuilder()
            .uri(URI.create(baseUrl + "/usuarios"))
            .header("X-Correlation-Id", correlationId)
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(401, response.statusCode());

        String headerCorrelation = response
            .headers()
            .firstValue("X-Correlation-Id")
            .orElse(null);
        assertNotNull(headerCorrelation);
        assertEquals(correlationId, headerCorrelation);

        JsonNode root = objectMapper.readTree(response.body());
        assertEquals("NAO_AUTENTICADO", root.path("erro").asText());
        assertEquals("/usuarios", root.path("path").asText());
        assertEquals(correlationId, root.path("correlationId").asText());

        String timestamp = root.path("timestamp").asText();
        assertFalse(timestamp.isBlank());
        assertTrue(timestamp.contains("T"));
    }
}



