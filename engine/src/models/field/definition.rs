use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};

use crate::database::Database;
use crate::models::field::kind::FieldKind;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct FieldDefinition {
    pub definition_id: String,
    pub kind: FieldKind,
    pub name: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl FieldDefinition {
    pub async fn create(
        kind: FieldKind,
        name: String,
        database: &Database,
    ) -> Result<FieldDefinition, sqlx::Error> {
        query_as!(
            FieldDefinition,
            "INSERT INTO field_definitions (kind, name) VALUES ($1, $2) RETURNING *",
            kind.to_string(),
            name
        )
        .fetch_one(&database.pool)
        .await
    }
}
