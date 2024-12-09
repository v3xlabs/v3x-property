use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};

use crate::{database::Database, routes::item::ItemDataField};

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemField {
    pub item_id: String,
    pub definition_id: String,
    pub value: serde_json::Value,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl ItemField {
    pub async fn new(
        db: &Database,
        item_id: String,
        definition_id: String,
        value: serde_json::Value,
    ) -> Result<ItemField, sqlx::Error> {
        query_as!(
            ItemField,
            "INSERT INTO item_fields (item_id, definition_id, value) VALUES ($1, $2, $3) RETURNING *",
            item_id,
            definition_id,
            value
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_item_id(
        db: &Database,
        item_id: &str,
    ) -> Result<Vec<ItemField>, sqlx::Error> {
        query_as!(
            ItemField,
            "SELECT * FROM item_fields WHERE item_id = $1",
            item_id
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn get_by_item_id_with_definitions(
        db: &Database,
        item_id: &str,
    ) -> Result<Vec<ItemDataField>, sqlx::Error> {
        // join with field_definitions
        // remap description, placeholder, kind, to field_description, field_placeholder, field_kind
        query_as!(
            ItemDataField,
            r#"SELECT
                item_fields.*,
                field_definitions.name AS definition_name,
                field_definitions.kind AS definition_kind,
                field_definitions.description AS definition_description,
                field_definitions.placeholder AS definition_placeholder
            FROM item_fields
            JOIN field_definitions ON item_fields.definition_id = field_definitions.definition_id
            WHERE item_fields.item_id = $1"#,
            item_id
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn upsert(
        db: &Database,
        item_id: &str,
        definition_id: &str,
        value: &serde_json::Value,
    ) -> Result<ItemField, sqlx::Error> {
        query_as!(
            ItemField,
            "INSERT INTO item_fields (item_id, definition_id, value) VALUES ($1, $2, $3) ON CONFLICT (item_id, definition_id) DO UPDATE SET value = $3 RETURNING *",
            item_id,
            definition_id,
            value
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn delete(db: &Database, item_id: &str, definition_id: &str) -> Result<(), sqlx::Error> {
        query!(
            "DELETE FROM item_fields WHERE item_id = $1 AND definition_id = $2",
            item_id,
            definition_id
        )
        .execute(&db.pool)
        .await?;

        Ok(())
    }
}
