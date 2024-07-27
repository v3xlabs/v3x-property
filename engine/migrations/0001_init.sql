CREATE TABLE IF NOT EXISTS users
(
    id SERIAL PRIMARY KEY,
    oauth_sub VARCHAR(255) NOT NULL,
    oauth_data JSONB NOT NULL,
    nickname VARCHAR(255) NOT NULL
);
