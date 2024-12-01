-- Create the logs table
CREATE TABLE logs (
    log_id SERIAL PRIMARY KEY,
    resource_type TEXT NOT NULL,
    resource_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test log entry
INSERT INTO logs (resource_type, resource_id, user_id, action, data) VALUES ('test', 1, 1, 'test', 'test');

-- Create indexes for common queries
CREATE INDEX logs_resource_type_idx ON logs(resource_type);
CREATE INDEX logs_resource_id_idx ON logs(resource_id); 
CREATE INDEX logs_user_id_idx ON logs(user_id);
CREATE INDEX logs_action_idx ON logs(action);
CREATE INDEX logs_created_at_idx ON logs(created_at);

-- Add foreign key constraint to users table
ALTER TABLE logs
ADD CONSTRAINT logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
