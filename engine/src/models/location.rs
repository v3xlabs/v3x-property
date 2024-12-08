use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};

use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub location_id: i32,
    pub name: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Location {
    pub async fn new(db: &Database, name: String) -> Result<Location, sqlx::Error> {
        query_as!(
            Location,
            "INSERT INTO locations (name) VALUES ($1) RETURNING *",
            name
        )
        .fetch_one(&db.pool)
        .await
    }
}
