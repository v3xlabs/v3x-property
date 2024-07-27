use poem_openapi::Object;
use serde::{Deserialize, Serialize};

use crate::database::Database;

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Object)]
pub struct Media {
    /// Randomly generated ID
    pub id: i32,
    /// Alt text for the image
    pub description: String,
    /// URL of the image
    pub url: String,
}

impl Media {
    pub async fn get_by_id(id: i32, database: &Database) -> Result<Self, sqlx::Error> {
        let media = sqlx::query_as::<_, Self>("SELECT * FROM media WHERE id = $1")
            .bind(id)
            .fetch_one(&database.pool)
            .await?;

        Ok(media)
    }
}
