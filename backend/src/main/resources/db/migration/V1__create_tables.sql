CREATE TABLE IF NOT EXISTS usuario (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    telefone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(30) NOT NULL DEFAULT 'CLIENTE',
    saldo NUMERIC(19, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    data_nascimento DATE NOT NULL,
    is_primeiro_login BOOLEAN NOT NULL DEFAULT TRUE,
    senha_pix VARCHAR(255),
    CONSTRAINT ck_usuario_saldo_nao_negativo CHECK (saldo >= 0),
    CONSTRAINT ck_usuario_status_valido CHECK (status IN ('PENDENTE', 'ATIVA', 'SUSPENSA', 'BLOQUEADA', 'RECUSADA'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_email_lower ON usuario (email);

CREATE TABLE IF NOT EXISTS chave_pix (
    id BIGSERIAL PRIMARY KEY,
    valor VARCHAR(255) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_chave_pix_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT ck_chave_pix_tipo_valido CHECK (tipo IN ('CPF', 'EMAIL', 'TELEFONE'))
);

CREATE TABLE IF NOT EXISTS transacao (
    id VARCHAR(36) PRIMARY KEY,
    remetente_id BIGINT NOT NULL,
    destinatario_id BIGINT NOT NULL,
    valor NUMERIC(19, 2) NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(20) NOT NULL,
    CONSTRAINT fk_transacao_remetente FOREIGN KEY (remetente_id) REFERENCES usuario(id),
    CONSTRAINT fk_transacao_destinatario FOREIGN KEY (destinatario_id) REFERENCES usuario(id),
    CONSTRAINT ck_transacao_valor_positivo CHECK (valor > 0)
);

CREATE INDEX IF NOT EXISTS idx_transacao_remetente_data ON transacao (remetente_id, data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_transacao_destinatario_data ON transacao (destinatario_id, data_hora DESC);

