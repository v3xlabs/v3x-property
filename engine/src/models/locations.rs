use serde::{Deserialize, Serialize};
use sqlx::prelude::*;

use crate::database::Database;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub location_id: i32,
    pub name: String,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
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
