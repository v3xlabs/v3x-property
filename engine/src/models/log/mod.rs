use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow, query_as};

use crate::database::Database;

/// Represents a log entry
/// When an action is performed on a resource, a log entry is created
/// This resource can then be queried by user, resource_type, (resource_type + resource_id), or action
#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub log_id: i32,
    pub resource_type: String,
    pub resource_id: i32,
    pub user_id: i32,
    pub action: String,
    pub data: String,
    pub created_at: DateTime<Utc>,
}

impl LogEntry {
    /// Create a new log entry
    /// Let postgres generate the id and created_at
    pub async fn new(
        db: &Database,
        resource_type: String,
        resource_id: i32,
        user_id: i32,
        action: String,
        data: String,
    ) -> Result<Self, sqlx::Error> {
        let log_entry = query_as!(
            LogEntry,
            "INSERT INTO logs (resource_type, resource_id, user_id, action, data) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            resource_type, resource_id, user_id, action, data
        ).fetch_one(&db.pool).await?;

        Ok(log_entry)
    }

    /// Find by log_id
    pub async fn find_by_log_id(db: &Database, log_id: i32) -> Result<Self, sqlx::Error> {
        let log_entry = query_as!(LogEntry, "SELECT * FROM logs WHERE log_id = $1", log_id)
            .fetch_one(&db.pool)
            .await?;

        Ok(log_entry)
    }
}
