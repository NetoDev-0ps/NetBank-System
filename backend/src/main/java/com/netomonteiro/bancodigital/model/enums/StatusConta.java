package com.netomonteiro.bancodigital.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StatusConta {
    PENDENTE("Em análise"),
    ATIVA("Conta Ativa"),
    SUSPENSA("Conta Suspensa por violação"),
    BLOQUEADA("Banido permanentemente"),
    RECUSADA("Cadastro não aprovado");

    private final String descricao;

    // Método Poka-Yoke: Define quem pode ou não logar
    public boolean podeFazerLogin() {
        return this == ATIVA || this == PENDENTE || this == SUSPENSA;
    }

    // Define quem pode tentar se cadastrar de novo
    public boolean podeTentarNovoCadastro() {
        return this == RECUSADA; // BLOQUEADO não pode voltar nunca
    }
}