CREATE TABLE IF NOT EXISTS media
(
    id INT PRIMARY KEY,
    description VARCHAR(255),
    url VARCHAR(255) NOT NULL,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO media (id, description, url, created) VALUES (1, 'My Cool Property', 'https://media.s-bol.com/VZVXoqVokWkv/z700v2/960x1200.jpg', NOW());

CREATE TABLE IF NOT EXISTS product_media
(
    product_id INT NOT NULL,
    media_id INT NOT NULL,
    PRIMARY KEY (product_id, media_id)
);

INSERT INTO product_media (product_id, media_id) VALUES (1, 1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS property_media
(
    property_id INT NOT NULL,
    media_id INT NOT NULL,
    PRIMARY KEY (property_id, media_id)
);

INSERT INTO property_media (property_id, media_id) VALUES (4, 1) ON CONFLICT DO NOTHING;
