use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};

use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub tag_id: i32,
    pub name: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Tag {
    pub async fn new(db: &Database, name: &str) -> Result<Tag, sqlx::Error> {
        query_as!(Tag, "INSERT INTO tags (name) VALUES ($1) RETURNING *", name.into())
            .fetch_one(&db.pool)
            .await
    }

    pub async fn get_all(db: &Database) -> Result<Vec<Tag>, sqlx::Error> {
        query_as!(Tag, "SELECT * FROM tags")
            .fetch_all(&db.pool)
            .await
    }

    pub async fn delete(db: &Database, tag_id: i32) -> Result<Tag, sqlx::Error> {
        query_as!(Tag, "DELETE FROM tags WHERE tag_id = $1 RETURNING *", tag_id)
            .fetch_one(&db.pool)
            .await
    }
}
