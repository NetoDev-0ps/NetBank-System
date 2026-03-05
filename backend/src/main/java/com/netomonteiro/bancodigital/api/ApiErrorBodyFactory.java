package com.netomonteiro.bancodigital.api;

import com.netomonteiro.bancodigital.config.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.MDC;

public final class ApiErrorBodyFactory {

    private static final String CORRELATION_MDC_KEY = "correlationId";

    private ApiErrorBodyFactory() {}

    public static Map<String, Object> build(String errorCode, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("erro", errorCode);
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("path", request == null ? null : request.getRequestURI());

        String correlationId = resolveCorrelationId(request);
        if (correlationId != null) {
            body.put("correlationId", correlationId);
        }

        return body;
    }

    public static String resolveCorrelationId(HttpServletRequest request) {
        String correlationId = MDC.get(CORRELATION_MDC_KEY);
        if (isBlank(correlationId) && request != null) {
            correlationId = request.getHeader(CorrelationIdFilter.HEADER_NAME);
        }
        if (isBlank(correlationId) && request != null) {
            Object attr = request.getAttribute(CorrelationIdFilter.HEADER_NAME);
            if (attr != null) {
                correlationId = String.valueOf(attr);
            }
        }

        return isBlank(correlationId) ? null : correlationId;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}