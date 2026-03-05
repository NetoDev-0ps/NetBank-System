CREATE TABLE IF NOT EXISTS login_attempt (
    login_key VARCHAR(255) PRIMARY KEY,
    failures INTEGER NOT NULL DEFAULT 0,
    first_failure_at TIMESTAMP,
    lock_until TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_attempt_lock_until ON login_attempt (lock_until);
CREATE INDEX IF NOT EXISTS idx_login_attempt_updated_at ON login_attempt (updated_at DESC);

ALTER TABLE transacao
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(120);

CREATE UNIQUE INDEX IF NOT EXISTS ux_transacao_remetente_idempotency
    ON transacao (remetente_id, idempotency_key);
