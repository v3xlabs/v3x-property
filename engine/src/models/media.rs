use serde::{Deserialize, Serialize};
use sqlx::prelude::*;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct Media {
    pub media_id: i32,
    pub description: Option<String>,
    pub url: String,
    pub kind: String,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
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
            description,
            url,
            kind
        )
        .fetch_one(&database.pool)
        .await
    }
}
