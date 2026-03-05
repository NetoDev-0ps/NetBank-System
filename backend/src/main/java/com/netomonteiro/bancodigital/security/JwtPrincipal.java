package com.netomonteiro.bancodigital.security;

public record JwtPrincipal(
    Long userId,
    String email,
    String role
) {}
