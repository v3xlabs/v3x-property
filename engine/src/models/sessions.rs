use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, types::ipnetwork::IpNetwork};

use crate::database::Database;

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Object)]
pub struct Session {
    pub session_id: String,
    pub user_id: i32,
    pub user_agent: String,
    pub user_ip: String,
    pub valid: bool,
    pub last_access: DateTime<Utc>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Session {
    pub async fn new(
        session_id: &str,
        user_id: i32,
        user_agent: &str,
        user_ip: &IpNetwork,
        database: &Database,
    ) -> Result<Self, sqlx::Error> {
        let session = query_as!(Session,
            "INSERT INTO sessions (session_id, user_id, user_agent, user_ip) VALUES ($1, $2, $3, $4) RETURNING *",
            session_id, user_id, user_agent, user_ip.to_string()
        )
        .fetch_one(&database.pool)
        .await?;
        Ok(session)
    }

    pub async fn _get_by_id(id: &str, database: &Database) -> Result<Option<Self>, sqlx::Error> {
        let session = query_as!(
            Session,
            "SELECT * FROM sessions WHERE session_id = $1 AND valid = TRUE",
            id
        )
        .fetch_optional(&database.pool)
        .await?;

        Ok(session)
    }

    pub async fn try_access(id: &str, database: &Database) -> Result<Option<Self>, sqlx::Error> {
        let session = query_as!(
            Session,
            "UPDATE sessions SET last_access = NOW() WHERE session_id = $1 AND valid = TRUE RETURNING *",
            id
        )
        .fetch_optional(&database.pool)
        .await?;

        Ok(session)
    }

    /// Get all sessions for a user that are valid
    pub async fn get_by_user_id(
        user_id: i32,
        database: &Database,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let sessions = query_as!(
            Session,
            "SELECT * FROM sessions WHERE user_id = $1 AND valid = TRUE",
            user_id
        )
        .fetch_all(&database.pool)
        .await?;

        Ok(sessions)
    }

    /// Set every session to invalid
    pub async fn invalidate_by_user_id(
        user_id: i32,
        database: &Database,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let sessions = query_as!(
            Session,
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1 RETURNING *",
            user_id
        )
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
        let sessions = query_as!(
            Session,
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1 AND session_id = $2 RETURNING *",
            user_id,
            id
        )
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
        let sessions = query_as!(
            Session,
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1 AND last_access < $2 RETURNING *",
            user_id,
            _invalidate_before
        )
        .fetch_all(&database.pool)
        .await?;

        Ok(sessions)
    }
}
