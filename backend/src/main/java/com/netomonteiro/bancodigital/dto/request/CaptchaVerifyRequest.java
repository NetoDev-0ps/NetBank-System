package com.netomonteiro.bancodigital.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CaptchaVerifyRequest(
    @NotBlank(message = "CAPTCHA_CHALLENGE_TOKEN_OBRIGATORIO")
    String challengeToken,

    @NotNull(message = "CAPTCHA_SLIDER_OBRIGATORIO")
    @Min(value = 0, message = "CAPTCHA_SLIDER_INVALIDO")
    @Max(value = 100, message = "CAPTCHA_SLIDER_INVALIDO")
    Integer sliderValue
) {}
