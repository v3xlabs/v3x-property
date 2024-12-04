use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as, FromRow};

use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize, Default)]
pub struct Media {
    pub media_id: i32,
    pub description: Option<String>,
    pub url: String,
    pub kind: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize, Default)]
pub struct LinkedItem {
    pub item_id: String,
    pub name: String,
    /// The first media we find linked to this item
    pub media_id: i32,
}

impl Media {
    pub async fn new(
        db: &Database,
        description: String,
        url: String,
        kind: String,
    ) -> Result<Media, sqlx::Error> {
        query_as!(
            Media,
            "INSERT INTO media (description, url, kind) VALUES ($1, $2, $3) RETURNING *",
            Some(description),
            url,
            kind
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_id(db: &Database, media_id: i32) -> Result<Option<Media>, sqlx::Error> {
        query_as!(Media, "SELECT * FROM media WHERE media_id = $1", media_id)
            .fetch_optional(&db.pool)
            .await
    }

    pub async fn get_all(db: &Database) -> Result<Vec<Media>, sqlx::Error> {
        query_as!(Media, "SELECT * FROM media")
            .fetch_all(&db.pool)
            .await
    }

    pub async fn get_unassigned(db: &Database) -> Result<Vec<Media>, sqlx::Error> {
        // Find all media that dont have a MediaItem to link them to an item
        // This is useful for finding media that is not yet assigned to an item
        // and can be used for creating new items
        query_as!(
            Media,
            "SELECT * FROM media WHERE media_id NOT IN (SELECT media_id FROM item_media)"
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn get_linked_items(
        db: &Database,
        media_id: i32,
    ) -> Result<Vec<LinkedItem>, sqlx::Error> {
        query_as!(
            LinkedItem,
            r#"
        SELECT im.item_id, i.name, im.media_id FROM item_media im
        JOIN items i ON im.item_id = i.item_id
        WHERE im.media_id = $1
        "#,
            media_id
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn delete(self, db: &Database) -> Result<(), sqlx::Error> {
        query!("DELETE FROM media WHERE media_id = $1", self.media_id)
            .execute(&db.pool)
            .await
            .map(|_| ())
    }
}
