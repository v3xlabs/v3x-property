use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};

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

    pub async fn get_by_id(db: &Database, media_id: i32) -> Result<Media, sqlx::Error> {
        query_as!(Media, "SELECT * FROM media WHERE media_id = $1", media_id)
            .fetch_one(&db.pool)
            .await
    }
}
