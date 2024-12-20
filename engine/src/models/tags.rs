use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};

use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub tag_id: i32,
    pub name: String,
    pub color: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Tag {
    pub async fn new(db: &Database, name: &str, color: Option<String>) -> Result<Tag, sqlx::Error> {
        query_as!(Tag, "INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING *", name.into(), color.unwrap_or("".to_string()))
            .fetch_one(&db.pool)
            .await
    }

    pub async fn get_all(db: &Database) -> Result<Vec<Tag>, sqlx::Error> {
        query_as!(Tag, "SELECT * FROM tags")
            .fetch_all(&db.pool)
            .await
    }

    pub async fn get_by_item_id(db: &Database, item_id: &str) -> Result<Vec<Tag>, sqlx::Error> {
        query_as!(Tag, "SELECT t.* FROM tags t JOIN items_to_tags it ON t.tag_id = it.tag_id WHERE it.item_id = $1", item_id)
            .fetch_all(&db.pool)
            .await
    }

    pub async fn get_by_id(db: &Database, tag_id: i32) -> Result<Tag, sqlx::Error> {
        tracing::info!("Getting tag by id: {}", tag_id);

        query_as!(Tag, "SELECT * FROM tags WHERE tag_id = $1", tag_id)
            .fetch_one(&db.pool)
            .await
    }

    pub async fn edit(db: &Database, tag_id: i32, name: &str, color: Option<String>) -> Result<Tag, sqlx::Error> {
        query_as!(Tag, "UPDATE tags SET name = $1, color = $2 WHERE tag_id = $3 RETURNING *", name.into(), color.unwrap_or("".to_string()), tag_id)
            .fetch_one(&db.pool)
            .await
    }

    pub async fn delete(db: &Database, tag_id: i32) -> Result<Tag, sqlx::Error> {
        query_as!(Tag, "DELETE FROM tags WHERE tag_id = $1 RETURNING *", tag_id)
            .fetch_one(&db.pool)
            .await
    }
}
