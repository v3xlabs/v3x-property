
ALTER TABLE items DROP COLUMN location_id;

DROP TABLE locations;

CREATE TABLE locations (
    location_id TEXT PRIMARY KEY, -- Unique identifier for each location
    name TEXT NOT NULL, -- Name of the location
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the location was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- When the location was last updated
);

-- Add item_location table
-- Items can be located at a location (`locations` table with `location_id`) (these can be text)
-- Items can also currently be located at a user (`users` table with `user_id`) (integer)
-- Items can also be currently located with another item (`items` table with `item_id`) (these can be text)

CREATE TABLE item_locations (
    item_id TEXT PRIMARY KEY,
    location_id TEXT REFERENCES locations(location_id),
    location_user_id INTEGER REFERENCES users(user_id),
    location_item_id TEXT REFERENCES items(item_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- update policies

INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('location', NULL, 'read', 'authed', 'true'),
    ('location', NULL, 'write', 'user', '2');
