package com.netomonteiro.bancodigital.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
        "spring.datasource.url=jdbc:h2:mem:testdb-actuator;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
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
class ActuatorHealthIntegrationTest {

    @LocalServerPort
    private int port;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void shouldExposeHealthInfoAndPrometheusWithoutAuthentication() throws IOException, InterruptedException {
        String baseUrl = "http://localhost:" + port;
        HttpClient client = HttpClient.newHttpClient();
        String correlationId = "obs-correlation-id";

        HttpRequest healthRequest = HttpRequest
            .newBuilder()
            .uri(URI.create(baseUrl + "/actuator/health"))
            .header("X-Correlation-Id", correlationId)
            .GET()
            .build();

        HttpResponse<String> healthResponse = client.send(
            healthRequest,
            HttpResponse.BodyHandlers.ofString()
        );

        assertEquals(200, healthResponse.statusCode());
        assertEquals(
            correlationId,
            healthResponse.headers().firstValue("X-Correlation-Id").orElse(null)
        );

        JsonNode healthBody = objectMapper.readTree(healthResponse.body());
        assertEquals("UP", healthBody.path("status").asText());

        HttpRequest infoRequest = HttpRequest
            .newBuilder()
            .uri(URI.create(baseUrl + "/actuator/info"))
            .header("X-Correlation-Id", correlationId)
            .GET()
            .build();

        HttpResponse<String> infoResponse = client.send(infoRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, infoResponse.statusCode());

        JsonNode infoBody = objectMapper.readTree(infoResponse.body());
        JsonNode appNode = infoBody.path("app");
        assertNotNull(appNode);
        assertTrue(appNode.has("name"));

        HttpRequest prometheusRequest = HttpRequest
            .newBuilder()
            .uri(URI.create(baseUrl + "/actuator/prometheus"))
            .GET()
            .build();

        HttpResponse<String> prometheusResponse = client.send(
            prometheusRequest,
            HttpResponse.BodyHandlers.ofString()
        );

        assertEquals(200, prometheusResponse.statusCode());
        assertTrue(prometheusResponse.body().contains("jvm_memory_used_bytes"));
    }
}




