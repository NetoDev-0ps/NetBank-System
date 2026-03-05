package com.netomonteiro.bancodigital.service;

import com.netomonteiro.bancodigital.dto.response.UsuarioResponseDTO;
import com.netomonteiro.bancodigital.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public UsuarioResponseDTO toDto(Usuario usuario) {
        return new UsuarioResponseDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getCpf(),
            usuario.getTelefone(),
            usuario.getSaldo(),
            usuario.getStatus(),
            usuario.getDataNascimento(),
            usuario.getCargo(),
            Boolean.TRUE.equals(usuario.getPrimeiroLogin())
        );
    }
}