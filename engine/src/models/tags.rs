use serde::{Deserialize, Serialize};
use sqlx::prelude::*;

use crate::database::Database;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub tag_id: i32,
    pub name: String,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl Tag {
    pub async fn create(name: String, database: &Database) -> Result<Tag, sqlx::Error> {
        sqlx::query_as!(Tag, "INSERT INTO tags (name) VALUES ($1) RETURNING *", name)
            .fetch_one(&database.pool)
            .await
    }
}
