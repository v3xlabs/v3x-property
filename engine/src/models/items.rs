use serde::{Deserialize, Serialize};
use sqlx::prelude::*;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub item_id: String,
    pub name: String,
    pub location_id: Option<i32>,
    pub product_id: Option<i32>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl Item {
    pub async fn create(
        item_id: String,
        name: String,
        location_id: Option<i32>,
        product_id: Option<i32>,
        database: &Database,
    ) -> Result<Item, sqlx::Error> {
        sqlx::query_as!(
            Item,
            "INSERT INTO items (item_id, name, location_id, product_id) VALUES ($1, $2, $3, $4) RETURNING *",
            item_id,
            name,
            location_id,
            product_id
        )
        .fetch_one(&database.pool)
        .await
    }
}

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
        sqlx::query_as!(
            ItemMedia,
            "INSERT INTO item_media (item_id, media_id) VALUES ($1, $2) RETURNING *",
            item_id,
            media_id
        )
        .fetch_one(&database.pool)
        .await
    }
}
