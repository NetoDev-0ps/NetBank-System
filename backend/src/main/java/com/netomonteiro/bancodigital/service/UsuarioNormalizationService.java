package com.netomonteiro.bancodigital.service;

import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class UsuarioNormalizationService {

    public String normalizarCpf(String cpf) {
        return cpf == null ? null : cpf.replaceAll("\\D", "");
    }

    public String normalizarTelefone(String telefone) {
        return telefone == null ? null : telefone.replaceAll("\\D", "");
    }

    public String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    public String normalizarBusca(String busca) {
        return busca == null ? null : busca.trim();
    }
}