use std::net::IpAddr;

use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::types::chrono;

use crate::database::Database;

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Object)]
pub struct SessionState {
    pub id: String,
    pub user_id: i32,
    pub user_agent: String,
    pub user_ip: IpAddr,
    pub last_access: chrono::DateTime<chrono::Utc>,
    pub valid: bool,
}

impl SessionState {
    pub async fn new(
        session_id: &str,
        user_id: i32,
        user_agent: &str,
        user_ip: &IpAddr,
        database: &Database,
    ) -> Result<Self, sqlx::Error> {
        let session = sqlx::query_as::<_, SessionState>(
            "INSERT INTO sessions (id, user_id, user_agent, user_ip) VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(session_id)
        .bind(user_id)
        .bind(user_agent)
        .bind(user_ip)
        .fetch_one(&database.pool)
        .await?;
        Ok(session)
    }

    pub async fn _get_by_id(id: &str, database: &Database) -> Result<Option<Self>, sqlx::Error> {
        let session = sqlx::query_as::<_, SessionState>(
            "SELECT * FROM sessions WHERE id = $1 AND valid = TRUE",
        )
        .bind(id)
        .fetch_optional(&database.pool)
        .await?;

        Ok(session)
    }

    pub async fn try_access(id: &str, database: &Database) -> Result<Option<Self>, sqlx::Error> {
        let session = sqlx::query_as::<_, SessionState>(
            "UPDATE sessions SET last_access = NOW() WHERE id = $1 AND valid = TRUE RETURNING *",
        )
        .bind(id)
        .fetch_optional(&database.pool)
        .await?;

        Ok(session)
    }

    /// Get all sessions for a user that are valid
    pub async fn get_by_user_id(
        user_id: i32,
        database: &Database,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let sessions = sqlx::query_as::<_, SessionState>(
            "SELECT * FROM sessions WHERE user_id = $1 AND valid = TRUE",
        )
        .bind(user_id)
        .fetch_all(&database.pool)
        .await?;

        Ok(sessions)
    }

    /// Set every session to invalid
    pub async fn invalidate_by_user_id(
        user_id: i32,
        database: &Database,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let sessions = sqlx::query_as::<_, SessionState>(
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1",
        )
        .bind(user_id)
        .fetch_all(&database.pool)
        .await?;

        Ok(sessions)
    }

    /// Set session to invalid by id
    pub async fn invalidate_by_id(
        id: &str,
        user_id: i32,
        database: &Database,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let sessions = sqlx::query_as::<_, SessionState>(
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1 AND id = $2",
        )
        .bind(user_id)
        .bind(id)
        .fetch_all(&database.pool)
        .await?;

        Ok(sessions)
    }

    /// Invalidate all sessions for a user that are older than the given time
    pub async fn _invalidate_by_user_id_by_time(
        user_id: i32,
        database: &Database,
        _invalidate_before: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let sessions = sqlx::query_as::<_, SessionState>(
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1 AND last_access < $2",
        )
        .bind(user_id)
        .fetch_all(&database.pool)
        .await?;

        Ok(sessions)
    }
}
