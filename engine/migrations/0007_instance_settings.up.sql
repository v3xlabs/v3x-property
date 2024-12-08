--- Create custom enum value for id_casing
CREATE TYPE id_casing AS ENUM ('upper', 'lower');

--- Introduce InstanceSettings
CREATE TABLE instance_settings (
    instance_id SERIAL PRIMARY KEY,
    id_casing_preference id_casing NOT NULL,
    last_item_id bigint NOT NULL
);
