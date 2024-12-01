use serde::{Deserialize, Serialize};
use sqlx::query_as;

use crate::database::Database;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemMedia {
    pub item_id: String,
    pub media_id: i32,
}

impl ItemMedia {
    pub async fn create(
        item_id: String,
        media_id: i32,
        database: &Database,
    ) -> Result<ItemMedia, sqlx::Error> {
        query_as!(
            ItemMedia,
            "INSERT INTO item_media (item_id, media_id) VALUES ($1, $2) RETURNING *",
            item_id,
            media_id
        )
        .fetch_one(&database.pool)
        .await
    }
}
