-- Add root_location_id field to the locations table
ALTER TABLE locations ADD COLUMN root_location_id TEXT;

-- Add index to the root_location_id field
CREATE INDEX idx_locations_root_location_id ON locations (root_location_id);
