package com.netomonteiro.bancodigital.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StatusConta {
    PENDENTE("Em analise"),
    ATIVA("Conta ativa"),
    SUSPENSA("Conta suspensa"),
    BLOQUEADA("Conta bloqueada"),
    RECUSADA("Cadastro recusado");

    private final String descricao;

    public boolean podeFazerLogin() {
        return this == ATIVA;
    }

    public boolean podeTentarNovoCadastro() {
        return this == RECUSADA;
    }

    public boolean podeTransicionarPara(StatusConta destino) {
        if (destino == null || this == destino) {
            return false;
        }

        return switch (this) {
            case PENDENTE -> destino == ATIVA || destino == RECUSADA;
            case ATIVA -> destino == SUSPENSA || destino == BLOQUEADA;
            case SUSPENSA -> destino == ATIVA || destino == BLOQUEADA;
            case BLOQUEADA, RECUSADA -> false;
        };
    }
}