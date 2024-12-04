--- Alter logentry resource_id to be text
ALTER TABLE logs
ALTER COLUMN resource_id TYPE TEXT USING resource_id::TEXT;
