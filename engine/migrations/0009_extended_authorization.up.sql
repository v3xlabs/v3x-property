
-- Authed users can read all search
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('search', NULL, 'read', 'authed', 'true');

-- Only the first signed in user (user_id = 2) can write to search
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('search', NULL, 'write', 'user', '2');
