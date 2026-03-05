package com.netomonteiro.bancodigital.dto.response;

public record CaptchaVerifyResponse(String proofToken, long expiresInSeconds) {}
