ALTER TABLE usuario DROP CONSTRAINT IF EXISTS ck_usuario_status_valido;

ALTER TABLE usuario
    ADD CONSTRAINT ck_usuario_status_valido
    CHECK (status IN ('PENDENTE', 'ATIVA', 'SUSPENSA', 'BLOQUEADA', 'ENCERRADA', 'RECUSADA'));
