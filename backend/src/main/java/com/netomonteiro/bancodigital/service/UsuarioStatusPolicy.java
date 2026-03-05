package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.model.enums.StatusConta;
import org.springframework.stereotype.Component;

@Component
public class UsuarioStatusPolicy {

    public void validarLogin(StatusConta status) {
        switch (status) {
            case PENDENTE:
                throw new IllegalArgumentException("STATUS_PENDENTE");
            case SUSPENSA:
                throw new IllegalArgumentException("STATUS_SUSPENSO");
            case BLOQUEADA:
                throw new IllegalArgumentException("STATUS_BLOQUEADO");
            case RECUSADA:
                throw new IllegalArgumentException("STATUS_RECUSADO");
            case ATIVA:
                return;
            default:
                throw new IllegalArgumentException("STATUS_DESCONHECIDO");
        }
    }

    public void validarTransicao(StatusConta atual, StatusConta novoStatus) {
        if (novoStatus == null) {
            throw new IllegalArgumentException("STATUS_INVALIDO");
        }

        if (atual != null && atual.equals(novoStatus)) {
            return;
        }

        if (atual != null && !atual.podeTransicionarPara(novoStatus)) {
            throw new IllegalArgumentException("TRANSICAO_STATUS_INVALIDA");
        }
    }
}