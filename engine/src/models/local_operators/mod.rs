use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::query_as;

use crate::database::Database;

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct LocalOperator {
    pub operator_id: String,
    pub operator_endpoint: String,
    pub operator_last_heartbeat: DateTime<Utc>,
}

impl LocalOperator {
    pub async fn upsert(
        db: &Database,
        operator_id: &str,
        operator_endpoint: &str,
    ) -> Result<Self, anyhow::Error> {
        let x = query_as!(
            LocalOperator,
            "INSERT INTO local_operators (operator_id, operator_endpoint, operator_last_heartbeat) VALUES ($1, $2, NOW()) ON CONFLICT (operator_id) DO UPDATE SET operator_last_heartbeat = NOW() RETURNING *",
            operator_id,
            operator_endpoint
        )
        .fetch_one(&db.pool)
        .await?;

        Ok(x)
    }

    pub async fn list_operators(db: &Database) -> Result<Vec<Self>, sqlx::Error> {
        let x = query_as!(LocalOperator, "SELECT * FROM local_operators")
            .fetch_all(&db.pool)
            .await?;

        Ok(x)
    }

    pub async fn get_operator_by_id(db: &Database, operator_id: &str) -> Result<Self, sqlx::Error> {
        let x = query_as!(LocalOperator, "SELECT * FROM local_operators WHERE operator_id = $1", operator_id)
            .fetch_one(&db.pool)
            .await?;

        Ok(x)
    }
}
