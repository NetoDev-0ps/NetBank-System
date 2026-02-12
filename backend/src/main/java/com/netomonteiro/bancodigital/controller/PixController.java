package com.netomonteiro.bancodigital.controller;

import com.netomonteiro.bancodigital.service.PixService;
import java.math.BigDecimal;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pix")
@CrossOrigin(origins = "*") // Libera o React para acessar
public class PixController {

    @Autowired
    private PixService pixService;

    // Endpoint: http://localhost:8080/pix/transferir
    @PostMapping("/transferir")
    public ResponseEntity<?> realizarPix(@RequestBody Map<String, Object> dados) {
        try {
            // 1. Extraindo os dados que vieram do React
            String cpfRemetente = (String) dados.get("cpfRemetente");
            String chaveDestino = (String) dados.get("chaveDestino");

            // Conversão segura de número (previne erros se vier como Integer ou String)// Dentro do método realizarPix:
            BigDecimal valor = new BigDecimal(dados.get("valor").toString());
            pixService.transferirPorCpf(cpfRemetente, chaveDestino, valor);

            return ResponseEntity.ok().body(
                "{\"mensagem\": \"Transferência realizada com sucesso!\"}"
            );
        } catch (RuntimeException e) {
            // Erros de negócio (Saldo insuficiente, CPF não achado)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Erros inesperados
            return ResponseEntity.internalServerError().body("Erro interno: " + e.getMessage());
        }
    }
}
