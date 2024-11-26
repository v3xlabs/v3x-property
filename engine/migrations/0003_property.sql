-- Introduce basic property data
CREATE TABLE IF NOT EXISTS properties
(
    id INT PRIMARY KEY,
    owner_id INT NOT NULL,
    product_id INT NOT NULL,
    name VARCHAR(255),
    created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products
(
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tweakers_id INT[],
    ean VARCHAR(255)[],
    upc VARCHAR(255)[],
    sku VARCHAR(255)[],
    created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO properties (id, owner_id, product_id) VALUES (4, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO products (id, name, tweakers_id, ean, sku) VALUES (1, 'Anker 737 (PowerCore 24k)', ARRAY[1], ARRAY['0194644098728'], ARRAY['a1289', 'A1289011']) ON CONFLICT DO NOTHING;
