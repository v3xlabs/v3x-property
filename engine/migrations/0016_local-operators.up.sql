--- Create LocalOperator table
CREATE TABLE IF NOT EXISTS local_operators (
    operator_id TEXT PRIMARY KEY,
    operator_endpoint TEXT NOT NULL,
    operator_last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL
);

INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id
) VALUES (
    'local_operator', NULL, 'read', 'authed', 'true'
);

INSERT INTO policies (
    resource_type, resource_id, action, subject_type, subject_id
) VALUES (
    'local_operator', NULL, 'write', 'authed', 'true'
);
