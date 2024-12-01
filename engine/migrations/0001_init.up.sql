-- Independent tables first

-- Create Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY, -- Unique identifier for each user
    oauth_sub TEXT NOT NULL UNIQUE, -- OAuth subject identifier from authentication provider
    oauth_data JSONB NOT NULL, -- JSON data containing OAuth provider information
    nickname TEXT, -- Optional display name for the user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the user record was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- When the user record was last updated
);

-- Insert a system user
INSERT INTO users (user_id, oauth_sub, oauth_data, nickname) VALUES (1, '$$SYSTEM$$', '{}', 'System');

-- Create Sessions table
CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY, -- Unique session identifier
    user_id INTEGER NOT NULL, -- Reference to the user this session belongs to
    user_agent TEXT NOT NULL, -- Browser/client information
    user_ip TEXT NOT NULL, -- IP address of the client
    valid BOOLEAN NOT NULL DEFAULT TRUE, -- Whether the session is still valid
    last_access TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- When the session was last used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the session was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the session was last updated
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE -- Links session to user, deletes session when user is deleted
);

CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY, -- Unique identifier for each location
    name TEXT NOT NULL, -- Name of the location
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the location was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- When the location was last updated
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY, -- Unique identifier for each product
    name TEXT NOT NULL, -- Name of the product
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the product was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- When the product was last updated
);

CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY, -- Unique identifier for each tag
    name TEXT NOT NULL, -- Name of the tag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the tag was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- When the tag was last updated
);

CREATE TABLE field_definitions (
    definition_id TEXT PRIMARY KEY, -- Unique identifier for each field definition
    kind TEXT NOT NULL, -- Type of the field
    name TEXT NOT NULL, -- Name of the field
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the field definition was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- When the field definition was last updated
);

CREATE TABLE media (
    media_id SERIAL PRIMARY KEY, -- Unique identifier for each media item
    description TEXT, -- Description of the media
    url TEXT NOT NULL, -- URL where the media can be accessed
    kind TEXT NOT NULL, -- Type of media (image, video, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the media was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- When the media was last updated
);

-- Tables with single foreign key dependencies
CREATE TABLE items (
    item_id TEXT PRIMARY KEY, -- Unique identifier for each item
    name TEXT NOT NULL, -- Name of the item
    owner_id INTEGER, -- Reference to the user who owns this item
    location_id INTEGER, -- Reference to the location where this item is stored
    product_id INTEGER, -- Optional reference to the associated product
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the item was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- When the item was last updated
);   

-- Junction tables and tables with multiple dependencies
CREATE TABLE item_fields (
    item_id TEXT NOT NULL, -- Reference to the item
    definition_id TEXT NOT NULL, -- Reference to the field definition
    value JSONB NOT NULL, -- The value of the field for this item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the field value was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the field value was last updated
    PRIMARY KEY (item_id, definition_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE, -- Links field to item, deletes field when item is deleted
    FOREIGN KEY (definition_id) REFERENCES field_definitions(definition_id) ON DELETE CASCADE -- Links field to definition, deletes field when definition is deleted
);

CREATE TABLE item_media (
    item_id TEXT NOT NULL, -- Reference to the item
    media_id INTEGER NOT NULL, -- Reference to the media
    PRIMARY KEY (item_id, media_id)
    -- FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE, -- Links media to item, deletes link when item is deleted
    -- FOREIGN KEY (media_id) REFERENCES media(media_id) ON DELETE CASCADE -- Links media to item, deletes link when media is deleted
);

CREATE TABLE product_media (
    product_id INTEGER NOT NULL, -- Reference to the product
    media_id INTEGER NOT NULL, -- Reference to the media
    PRIMARY KEY (product_id, media_id)
    -- FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE, -- Links media to product, deletes link when product is deleted
    -- FOREIGN KEY (media_id) REFERENCES media(media_id) ON DELETE CASCADE -- Links media to product, deletes link when media is deleted
);

CREATE TABLE items_to_tags (
    item_id TEXT NOT NULL, -- Reference to the item
    tag_id INTEGER NOT NULL, -- Reference to the tag
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE, -- Links tag to item, deletes link when item is deleted
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE -- Links tag to item, deletes link when tag is deleted
); 