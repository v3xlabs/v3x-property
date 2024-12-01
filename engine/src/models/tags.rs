use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};
use chrono::{DateTime, Utc};
use poem_openapi::Object;
use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub tag_id: i32,
    pub name: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Tag {
    pub async fn create(name: String, database: &Database) -> Result<Tag, sqlx::Error> {
        query_as!(Tag, "INSERT INTO tags (name) VALUES ($1) RETURNING *", name)
            .fetch_one(&database.pool)
            .await
    }
}
