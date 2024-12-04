-- Alter logentry resource_id to be integer
ALTER TABLE logs
ALTER COLUMN resource_id TYPE INTEGER USING resource_id::INTEGER;
