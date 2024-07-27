CREATE TABLE IF NOT EXISTS sessions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INT NOT NULL,
    user_agent VARCHAR(255) NOT NULL,
    user_ip VARCHAR(255) NOT NULL,
    last_access TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid BOOLEAN NOT NULL DEFAULT TRUE
);
