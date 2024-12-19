-- Add down migration script here

DROP INDEX idx_locations_root_location_id;

ALTER TABLE locations DROP COLUMN root_location_id;
