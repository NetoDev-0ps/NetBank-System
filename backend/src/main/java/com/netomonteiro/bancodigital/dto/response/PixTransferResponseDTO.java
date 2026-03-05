package com.netomonteiro.bancodigital.dto.response;

import java.time.LocalDateTime;

public record PixTransferResponseDTO(String status, String idTransacao, LocalDateTime data) {}