use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use poem_openapi::Object;
use sqlx::FromRow;

use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub location_id: i32,
    pub name: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Location {
    pub async fn create(name: String, database: &Database) -> Result<Location, sqlx::Error> {
        sqlx::query_as!(
            Location,
            "INSERT INTO locations (name) VALUES ($1) RETURNING *",
            name
        )
        .fetch_one(&database.pool)
        .await
    }
}
