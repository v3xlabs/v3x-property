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
        definition_id: &str,
        name: &str,
        kind: &FieldKind,
        description: Option<&str>,
        placeholder: Option<&str>,
    ) -> Result<FieldDefinition, sqlx::Error> {
        query_as!(
            FieldDefinition,
            "INSERT INTO field_definitions (definition_id, kind, name, description, placeholder) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            definition_id,
            kind.to_string(),
            name,
            description,
            placeholder
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_all(db: &Database) -> Result<Vec<FieldDefinition>, sqlx::Error> {
        query_as!(FieldDefinition, "SELECT * FROM field_definitions")
            .fetch_all(&db.pool)
            .await
    }

    pub async fn get_by_definition_id(
        db: &Database,
        definition_id: &str,
    ) -> Result<Option<FieldDefinition>, sqlx::Error> {
        query_as!(FieldDefinition, "SELECT * FROM field_definitions WHERE definition_id = $1", definition_id)
            .fetch_optional(&db.pool)
            .await
    }

    pub async fn update(
        db: &Database,
        definition_id: &str,
        name: &str,
        kind: &FieldKind,
        description: Option<&str>,
        placeholder: Option<&str>,
    ) -> Result<FieldDefinition, sqlx::Error> {
        query_as!(
            FieldDefinition,
            "UPDATE field_definitions SET name = $2, kind = $3, description = $4, placeholder = $5 WHERE definition_id = $1 RETURNING *",
            definition_id,
            name,
            kind.to_string(),
            description,
            placeholder
        )
        .fetch_one(&db.pool)
        .await
    }
}
