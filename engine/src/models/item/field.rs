
use crate::database::Database;
use serde::{Deserialize, Serialize};

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemField {
    pub item_id: String,
    pub definition_id: String,
    pub value: serde_json::Value,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl ItemField {
    pub async fn create(
        item_id: String,
        definition_id: String,
        value: serde_json::Value,
        database: &Database,
    ) -> Result<ItemField, sqlx::Error> {
        sqlx::query_as!(
            ItemField,
            "INSERT INTO item_fields (item_id, definition_id, value) VALUES ($1, $2, $3) RETURNING *",
            item_id,
            definition_id,
            value
        )
        .fetch_one(&database.pool)
        .await
    }
}