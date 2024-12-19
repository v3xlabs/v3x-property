-- Add down migration script here

ALTER TABLE items ADD COLUMN location_id TEXT;

DROP TABLE item_locations;

DELETE FROM policies WHERE resource_type = 'location';
