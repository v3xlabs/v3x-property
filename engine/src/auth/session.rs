use serde::{Deserialize, Serialize};
use sqlx::types::chrono;
use uuid::Uuid;

use crate::database::Database;

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct SessionState {
    pub id: Uuid,
    pub user_id: i32,
    pub user_agent: String,
    pub last_access: chrono::DateTime<chrono::Utc>,
    pub valid: bool,
}

impl SessionState {
    pub async fn new(
        user_id: i32,
        user_agent: &str,
        user_ip: &str,
        database: &Database,
    ) -> Result<Self, sqlx::Error> {
        let session = sqlx::query_as::<_, SessionState>(
            "INSERT INTO sessions (user_id, user_agent, user_ip) VALUES ($1, $2, $3) RETURNING *",
        )
        .bind(user_id)
        .bind(user_agent)
        .bind(user_ip)
        .fetch_one(&database.pool)
        .await?;
        Ok(session)
    }

    pub async fn get_by_id(id: Uuid, database: &Database) -> Result<Self, sqlx::Error> {
        let session = sqlx::query_as::<_, SessionState>(
            "SELECT * FROM sessions WHERE id = $1 AND valid = TRUE",
        )
        .bind(id)
        .fetch_one(&database.pool)
        .await?;

        Ok(session)
    }

    pub async fn get_by_user_id(user_id: i32, database: &Database) -> Result<Vec<Self>, sqlx::Error> {
        let sessions = sqlx::query_as::<_, SessionState>(
            "SELECT * FROM sessions WHERE user_id = $1 AND valid = TRUE",
        )
        .bind(user_id)
        .fetch_all(&database.pool)
        .await?;

        Ok(sessions)
    }

    // Set every session to invalid
    pub async fn delete_by_user_id(user_id: i32, database: &Database) -> Result<Vec<Self>, sqlx::Error> {
        let sessions = sqlx::query_as::<_, SessionState>(
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1",
        )
        .bind(user_id)
        .fetch_all(&database.pool)
        .await?;

        Ok(sessions)
    }
}
