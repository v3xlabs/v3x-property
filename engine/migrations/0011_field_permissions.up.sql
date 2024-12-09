
-- Authed users can read, write, and delete fields
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('field', NULL, 'read', 'authed', 'true');
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('field', NULL, 'write', 'authed', 'true');
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('field', NULL, 'delete', 'authed', 'true');
