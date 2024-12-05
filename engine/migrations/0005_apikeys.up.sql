-- Introduce API Keys
-- Every API Key will have a name, a token (hashed value), a permission text field, and a user_id field.
CREATE TABLE api_keys (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    name TEXT NOT NULL,
    token TEXT NOT NULL,
    permissions TEXT NOT NULL
);

CREATE INDEX ON api_keys (token);
