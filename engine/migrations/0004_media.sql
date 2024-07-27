CREATE TABLE IF NOT EXISTS media
(
    id INT PRIMARY KEY,
    description VARCHAR(255),
    url VARCHAR(255) NOT NULL,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO media (id, description, url, created) VALUES (1, 'My Cool Property', 'https://media.s-bol.com/VZVXoqVokWkv/z700v2/960x1200.jpg', NOW());
