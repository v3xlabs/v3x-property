
-- Create search tasks table
CREATE TABLE search_tasks (
    task_id SERIAL PRIMARY KEY,
    external_task_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX ON search_tasks (external_task_id);

