-- Authed users can read logs
INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id) VALUES
    ('log', NULL, 'read', 'authed', 'true');
