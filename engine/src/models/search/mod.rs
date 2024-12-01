use std::fmt::Display;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow, query_as};

use crate::database::Database;

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "lowercase")]
pub enum SearchTaskStatus {
    Enqueued,
    Processing,
    Succeeded,
    Failed,
    Cancelled,
}

impl Display for SearchTaskStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl From<String> for SearchTaskStatus {
    fn from(status: String) -> Self {
        serde_json::from_str(&status).unwrap()
    }
}

/// Describes a search task triggered by some user.
/// This is used to track the progress of a search import task.
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SearchTask {
    pub task_id: i32,
    pub external_task_id: i32,
    pub status: SearchTaskStatus,
    pub updated_at: DateTime<Utc>,
}

impl SearchTask {
    pub async fn new(
        db: &Database,
        external_task_id: i32,
        status: SearchTaskStatus,
    ) -> Result<Self, sqlx::Error> {
        let status = status.to_string();

        query_as!(
            SearchTask,
            "INSERT INTO search_tasks (external_task_id, status) VALUES ($1, $2) RETURNING *",
            external_task_id,
            status.as_str(),
        )
        .fetch_one(&db.pool)
        .await
    }
}
