--- Create policies table
CREATE TABLE policies (
    policy_id SERIAL PRIMARY KEY,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    action TEXT NOT NULL,
    subject_type TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Authed users can read, write, delete all items
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('item', NULL, 'read', 'authed', 'true');
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('item', NULL, 'write', 'authed', 'true');
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('item', NULL, 'delete', 'authed', 'true');

-- Authed users can read, write, delete all products
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('product', NULL, 'read', 'authed', 'true');
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('product', NULL, 'write', 'authed', 'true');
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('product', NULL, 'delete', 'authed', 'true');

-- Authed users can read, write, delete all media
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('media', NULL, 'read', 'authed', 'true');
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('media', NULL, 'write', 'authed', 'true');
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('media', NULL, 'delete', 'authed', 'true');

-- Authed users can read all users
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('user', NULL, 'read', 'authed', 'true');

-- Only the first signed in user (user_id = 2) can write to users
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('user', NULL, 'write', 'user', '2');
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('user', NULL, 'delete', 'user', '2');

-- Authed users can read all instance settings
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('instance', 'settings', 'read', 'authed', 'true');

-- Only the first signed in user (user_id = 2) can write to instance settings
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('instance', 'settings', 'write', 'user', '2');

-- Update the policy_id column to continue at 1000
ALTER SEQUENCE policies_policy_id_seq RESTART WITH 1000;
