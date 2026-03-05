package com.netomonteiro.bancodigital.dto.response;

public record CaptchaChallengeResponse(
    String challengeToken,
    int target,
    int min,
    int max,
    int tolerance,
    long expiresInSeconds
) {}
