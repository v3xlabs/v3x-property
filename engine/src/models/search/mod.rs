use std::fmt::Display;

use chrono::{DateTime, Utc};
use meilisearch_sdk::tasks::Task;
use poem_openapi::{Enum, Object};
use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow, query_as};
use tracing::info;

use crate::database::Database;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Enum)]
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
        match status.to_lowercase().as_str() {
            "enqueued" => SearchTaskStatus::Enqueued,
            "processing" => SearchTaskStatus::Processing,
            "succeeded" => SearchTaskStatus::Succeeded,
            "failed" => SearchTaskStatus::Failed,
            "cancelled" => SearchTaskStatus::Cancelled,
            _ => panic!("Invalid search task status: {}", status),
        }
    }
}

impl From<&Task> for SearchTaskStatus {
    fn from(task: &Task) -> Self {
        match task {
            Task::Enqueued { .. } => SearchTaskStatus::Enqueued,
            Task::Processing { .. } => SearchTaskStatus::Processing,
            Task::Succeeded { .. } => SearchTaskStatus::Succeeded,
            Task::Failed { .. } => SearchTaskStatus::Failed,
        }
    }
}

/// Describes a search task triggered by some user.
/// This is used to track the progress of a search import task.
#[derive(Debug, Serialize, Deserialize, FromRow, Object)]
pub struct SearchTask {
    pub task_id: i32,
    pub external_task_id: i64,
    pub status: SearchTaskStatus,
    /// TODO: Make this a JSONB column
    pub details: Option<String>,
    pub updated_at: DateTime<Utc>,
}

impl SearchTask {
    pub async fn new(
        db: &Database,
        external_task_id: u32,
        status: SearchTaskStatus,
    ) -> Result<Self, sqlx::Error> {
        let status = status.to_string();
        let external_task_id = i64::from(external_task_id);

        query_as!(
            SearchTask,
            "INSERT INTO search_tasks (external_task_id, status) VALUES ($1, $2) RETURNING *",
            external_task_id,
            status
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn find_by_id(db: &Database, task_id: i32) -> Result<Self, sqlx::Error> {
        query_as!(
            SearchTask,
            "SELECT * FROM search_tasks WHERE task_id = $1",
            task_id
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn find_all(db: &Database) -> Result<Vec<Self>, sqlx::Error> {
        query_as!(
            SearchTask,
            "SELECT * FROM search_tasks ORDER BY updated_at DESC"
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn refresh(
        db: &Database,
        task_id: i32,
        external_task_id: i64,
        task: Task,
    ) -> Result<Self, sqlx::Error> {
        let status = SearchTaskStatus::from(&task).to_string();
        let details = match &task {
            Task::Enqueued { .. } => None,
            Task::Processing { .. } => None,
            Task::Succeeded { .. } => None,
            Task::Failed { .. } => Some(task.unwrap_failure().to_string()),
        };

        info!(
            "Refreshing task {} with status {}",
            external_task_id, status
        );

        query_as!(
            SearchTask,
            "UPDATE search_tasks SET status = $1, details = $2 WHERE task_id = $3 RETURNING *",
            status,
            details,
            task_id,
        )
        .fetch_one(&db.pool)
        .await
    }
}
