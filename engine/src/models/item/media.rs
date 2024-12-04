use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};

use crate::database::Database;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemMedia {
    pub item_id: String,
    pub media_id: i32,
}

impl ItemMedia {
    pub async fn new(
        db: &Database,
        item_id: &str,
        media_id: i32,
    ) -> Result<ItemMedia, sqlx::Error> {
        query_as!(
            ItemMedia,
            "INSERT INTO item_media (item_id, media_id) VALUES ($1, $2) RETURNING *",
            item_id,
            media_id
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn delete(db: &Database, item_id: &str, media_id: i32) -> Result<(), sqlx::Error> {
        query!(
            "DELETE FROM item_media WHERE item_id = $1 AND media_id = $2",
            item_id,
            media_id
        )
        .execute(&db.pool)
        .await?;

        Ok(())
    }

    pub async fn get_by_item_id(db: &Database, item_id: &str) -> Result<Vec<ItemMedia>, sqlx::Error> {
        query_as!(ItemMedia, "SELECT * FROM item_media WHERE item_id = $1", item_id)
            .fetch_all(&db.pool)
            .await
    }
}
