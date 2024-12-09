use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};

use crate::database::Database;
use crate::models::field::kind::FieldKind;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct FieldDefinition {
    pub definition_id: String,
    /// The kind of field
    pub kind: FieldKind,
    /// The name of the field
    pub name: String,
    /// Description of the field
    pub description: Option<String>,
    /// Placeholder text for the field
    pub placeholder: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl FieldDefinition {
    pub async fn new(
        db: &Database,
        kind: FieldKind,
        name: String,
    ) -> Result<FieldDefinition, sqlx::Error> {
        query_as!(
            FieldDefinition,
            "INSERT INTO field_definitions (kind, name) VALUES ($1, $2) RETURNING *",
            kind.to_string(),
            name
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_all(db: &Database) -> Result<Vec<FieldDefinition>, sqlx::Error> {
        query_as!(FieldDefinition, "SELECT * FROM field_definitions")
            .fetch_all(&db.pool)
            .await
    }
}
