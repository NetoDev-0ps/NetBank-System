package com.netomonteiro.bancodigital.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.netomonteiro.bancodigital.model.AdminUser;
import com.netomonteiro.bancodigital.model.Usuario;
import com.netomonteiro.bancodigital.model.enums.StatusConta;
import com.netomonteiro.bancodigital.repository.AdminUserRepository;
import com.netomonteiro.bancodigital.repository.ChavePixRepository;
import com.netomonteiro.bancodigital.repository.TransacaoRepository;
import com.netomonteiro.bancodigital.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private ChavePixRepository chavePixRepository;

    @Mock
    private TransacaoRepository transacaoRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private UsuarioService usuarioService;

    @BeforeEach
    void setup() {
        usuarioService = new UsuarioService(
            usuarioRepository,
            adminUserRepository,
            chavePixRepository,
            transacaoRepository,
            encoder,
            new UsuarioNormalizationService(),
            new UsuarioMapper(),
            new UsuarioStatusPolicy(),
            new BrazilPhoneValidator()
        );
    }

    @Test
    void shouldCreateCustomerWithNormalizedDataAndDefaults() {
        Usuario novo = new Usuario();
        novo.setNome("Maria da Silva");
        novo.setCpf("123.456.789-00");
        novo.setTelefone("(85) 99999-1111");
        novo.setEmail("Maria@Email.com");
        novo.setSenha("Senha@123");
        novo.setDataNascimento(LocalDate.of(1990, 1, 1));

        when(usuarioRepository.existsByCpf("12345678900")).thenReturn(false);
        when(usuarioRepository.existsByEmailIgnoreCase("maria@email.com")).thenReturn(false);
        when(usuarioRepository.existsByTelefone("85999991111")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario salvo = usuarioService.criar(novo);

        assertEquals("12345678900", salvo.getCpf());
        assertEquals("85999991111", salvo.getTelefone());
        assertEquals("maria@email.com", salvo.getEmail());
        assertEquals(StatusConta.PENDENTE, salvo.getStatus());
        assertEquals("CLIENTE", salvo.getCargo());
        assertEquals(BigDecimal.ZERO, salvo.getSaldo());
    }

    @Test
    void shouldRejectCreateWhenDddIsInvalid() {
        Usuario novo = new Usuario();
        novo.setNome("Maria da Silva");
        novo.setCpf("12345678900");
        novo.setTelefone("00999991111");
        novo.setEmail("maria@email.com");
        novo.setSenha("Senha@123");
        novo.setDataNascimento(LocalDate.of(1990, 1, 1));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> usuarioService.criar(novo));

        assertEquals("TELEFONE_DDD_INVALIDO", ex.getMessage());
    }

    @Test
    void shouldBlockLoginWhenStatusIsNotActive() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setCpf("12345678900");
        usuario.setEmail("cliente@netbank.com");
        usuario.setSenha(encoder.encode("senha123"));
        usuario.setStatus(StatusConta.SUSPENSA);
        usuario.setCargo("CLIENTE");

        when(usuarioRepository.findByEmailIgnoreCase("cliente@netbank.com")).thenReturn(Optional.of(usuario));

        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> usuarioService.loginCliente("123.456.789-00", "cliente@netbank.com", "senha123")
        );

        assertEquals("STATUS_SUSPENSO", ex.getMessage());
    }

    @Test
    void shouldLoginManagerFromAdminTable() {
        AdminUser admin = new AdminUser();
        admin.setId(11L);
        admin.setEmail("admin@netbank.com.br");
        admin.setSenhaHash(encoder.encode("SenhaForte@2026"));
        admin.setAtivo(true);

        when(adminUserRepository.findByEmailIgnoreCase("admin@netbank.com.br")).thenReturn(Optional.of(admin));

        AdminUser autenticado = usuarioService.loginGerente("admin@netbank.com.br", "SenhaForte@2026");

        assertEquals(11L, autenticado.getId());
        assertEquals("admin@netbank.com.br", autenticado.getEmail());
    }

    @Test
    void shouldRejectInvalidTransitionFromRecusadaToAtiva() {
        Usuario usuario = new Usuario();
        usuario.setId(30L);
        usuario.setStatus(StatusConta.RECUSADA);

        when(usuarioRepository.findById(30L)).thenReturn(Optional.of(usuario));

        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> usuarioService.atualizarStatus(30L, StatusConta.ATIVA)
        );

        assertEquals("TRANSICAO_STATUS_INVALIDA", ex.getMessage());
    }

    @Test
    void shouldApplyWelcomeBonusOnlyOnce() {
        Usuario usuario = new Usuario();
        usuario.setId(77L);
        usuario.setSaldo(BigDecimal.ZERO);
        usuario.setPrimeiroLogin(true);

        when(usuarioRepository.findById(77L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario primeiro = usuarioService.concluirPrimeiroAcesso(77L);
        Usuario segundo = usuarioService.concluirPrimeiroAcesso(77L);

        assertFalse(primeiro.getPrimeiroLogin());
        assertEquals(new BigDecimal("5000.00"), primeiro.getSaldo());
        assertEquals(new BigDecimal("5000.00"), segundo.getSaldo());
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void shouldDeletePixKeysAndTransactionsBeforeRemovingUser() {
        when(usuarioRepository.existsById(55L)).thenReturn(true);

        usuarioService.deletar(55L);

        verify(chavePixRepository).deleteByUsuarioId(55L);
        verify(transacaoRepository).deleteByRemetenteIdOrDestinatarioId(55L, 55L);
        verify(usuarioRepository).deleteById(55L);
    }
}
