package com.netomonteiro.bancodigital.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netomonteiro.bancodigital.api.ApiErrorBodyFactory;
import com.netomonteiro.bancodigital.security.JwtAuthenticationFilter;
import com.netomonteiro.bancodigital.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(
        HttpSecurity http,
        JwtService jwtService,
        AuthCookieProperties authCookieProperties,
        CsrfCookieFilter csrfCookieFilter
    ) throws Exception {
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtService, authCookieProperties);

        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokenRepository.setCookieName("XSRF-TOKEN");
        csrfTokenRepository.setHeaderName("X-XSRF-TOKEN");
        csrfTokenRepository.setCookiePath(authCookieProperties.getPath());

        CsrfTokenRequestAttributeHandler csrfTokenRequestHandler = new CsrfTokenRequestAttributeHandler();

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfTokenRepository)
                .csrfTokenRequestHandler(csrfTokenRequestHandler)
                .ignoringRequestMatchers(
                    "/auth/login",
                    "/auth/logout",
                    "/auth/captcha/**",
                    "/usuarios"
                )
            )
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout.disable())
            .headers(headers -> headers
                .contentTypeOptions(Customizer.withDefaults())
                .frameOptions(frame -> frame.sameOrigin())
                .referrerPolicy(referrer ->
                    referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)
                )
                .httpStrictTransportSecurity(hsts ->
                    hsts.includeSubDomains(true).preload(true).maxAgeInSeconds(31_536_000)
                )
                .permissionsPolicy(policy ->
                    policy.policy("geolocation=(), microphone=(), camera=(), payment=()")
                )
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(csrfCookieFilter, org.springframework.security.web.csrf.CsrfFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) ->
                    writeErrorResponse(
                        req,
                        res,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "NAO_AUTENTICADO"
                    )
                )
                .accessDeniedHandler((req, res, e) ->
                    writeErrorResponse(
                        req,
                        res,
                        HttpServletResponse.SC_FORBIDDEN,
                        "ACESSO_NEGADO"
                    )
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info", "/actuator/prometheus").permitAll()

                .requestMatchers(HttpMethod.GET, "/auth/captcha/challenge").permitAll()
                .requestMatchers(HttpMethod.POST, "/auth/captcha/verify").permitAll()
                .requestMatchers(HttpMethod.POST, "/usuarios").permitAll()
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/auth/logout").permitAll()
                .requestMatchers(HttpMethod.GET, "/auth/csrf").permitAll()

                .requestMatchers(HttpMethod.GET, "/usuarios").hasRole("GERENTE")
                .requestMatchers(HttpMethod.GET, "/usuarios/paginado").hasRole("GERENTE")
                .requestMatchers(HttpMethod.PATCH, "/usuarios/*/status").hasRole("GERENTE")
                .requestMatchers(HttpMethod.PATCH, "/usuarios/*/deposito").hasRole("GERENTE")
                .requestMatchers(HttpMethod.DELETE, "/usuarios/*").hasRole("GERENTE")
                .requestMatchers(HttpMethod.GET, "/auditoria").hasRole("GERENTE")
                .requestMatchers(HttpMethod.PATCH, "/usuarios/*/primeiro-acesso-concluido").hasRole("CLIENTE")
                .requestMatchers("/pix/**").hasRole("CLIENTE")

                .anyRequest().authenticated()
            );

        return http.build();
    }

    private static void writeErrorResponse(
        HttpServletRequest request,
        HttpServletResponse response,
        int status,
        String errorCode
    ) throws IOException {
        Map<String, Object> body = ApiErrorBodyFactory.build(errorCode, request);

        response.setStatus(status);
        response.setContentType("application/json");

        Object correlationId = body.get("correlationId");
        if (correlationId != null) {
            response.setHeader(CorrelationIdFilter.HEADER_NAME, String.valueOf(correlationId));
        }

        OBJECT_MAPPER.writeValue(response.getWriter(), body);
    }
}


