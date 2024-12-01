use crate::database::Database;
use crate::models::field::kind::FieldKind;
use serde::{Deserialize, Serialize};
use poem_openapi::Object;
use sqlx::{query_as, FromRow};

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct FieldDefinition {
    pub definition_id: String,
    pub kind: FieldKind,
    pub name: String,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
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
