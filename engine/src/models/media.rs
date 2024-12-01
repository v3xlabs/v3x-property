use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use poem_openapi::Object;
use chrono::{DateTime, Utc};
use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Media {
    pub media_id: i32,
    pub description: Option<String>,
    pub url: String,
    pub kind: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Media {
    pub async fn create(
        description: String,
        url: String,
        kind: String,
        database: &Database,
    ) -> Result<Media, sqlx::Error> {
        sqlx::query_as!(
            Media,
            "INSERT INTO media (description, url, kind) VALUES ($1, $2, $3) RETURNING *",
            Some(description),
            url,
            kind
        )
        .fetch_one(&database.pool)
        .await
    }

    pub async fn get_by_id(
        media_id: i32,
        database: &Database,
    ) -> Result<Media, sqlx::Error> {
        sqlx::query_as!(Media, "SELECT * FROM media WHERE media_id = $1", media_id)
            .fetch_one(&database.pool)
            .await
    }
}
