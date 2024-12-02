
-- Create search tasks table
CREATE TABLE search_tasks (
    task_id SERIAL PRIMARY KEY,
    external_task_id BIGINT NOT NULL,
    status TEXT NOT NULL,
    details TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON search_tasks (external_task_id);
