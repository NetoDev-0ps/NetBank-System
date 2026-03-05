package com.netomonteiro.bancodigital.controller;

import com.netomonteiro.bancodigital.api.ApiErrorBodyFactory;
import com.netomonteiro.bancodigital.security.LoginBlockedException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        String mensagemErro = ex.getBindingResult().getFieldErrors().isEmpty()
            ? "REQUISICAO_INVALIDA"
            : ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();

        return ResponseEntity.badRequest().body(ApiErrorBodyFactory.build(mensagemErro, request));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Object> handleEntityNotFound(
        EntityNotFoundException ex,
        HttpServletRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiErrorBodyFactory.build(ex.getMessage(), request));
    }

    @ExceptionHandler(LoginBlockedException.class)
    public ResponseEntity<Object> handleLoginBlocked(
        LoginBlockedException ex,
        HttpServletRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.TOO_MANY_REQUESTS)
            .header(HttpHeaders.RETRY_AFTER, String.valueOf(ex.getRetryAfterSeconds()))
            .body(ApiErrorBodyFactory.build(ex.getMessage(), request));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgument(
        IllegalArgumentException ex,
        HttpServletRequest request
    ) {
        return ResponseEntity.badRequest().body(ApiErrorBodyFactory.build(ex.getMessage(), request));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrity(
        DataIntegrityViolationException ex,
        HttpServletRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ApiErrorBodyFactory.build("CONFLITO_DE_DADOS", request));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneric(Exception ex, HttpServletRequest request) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiErrorBodyFactory.build("ERRO_INTERNO", request));
    }
}
