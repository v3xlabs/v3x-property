-- Add down migration script here
DELETE FROM policies WHERE resource_type = 'log';
