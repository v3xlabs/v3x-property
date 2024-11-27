use serde::{Deserialize, Serialize};
use sqlx::prelude::*;

use crate::database::Database;

#[derive(sqlx::Type, poem_openapi::Enum, Debug, Clone, Serialize, Deserialize)]
#[sqlx(type_name = "text")]
#[sqlx(rename_all = "lowercase")]
pub enum FieldKind {
    String,
    Number,
    Boolean,
    Json,
}

impl std::fmt::Display for FieldKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.to_string())
    }
}

impl From<String> for FieldKind {
    fn from(s: String) -> Self {
        match s.to_lowercase().as_str() {
            "string" => FieldKind::String,
            "number" => FieldKind::Number,
            "boolean" => FieldKind::Boolean,
            "json" => FieldKind::Json,
            _ => FieldKind::String,
        }
    }
}

impl From<FieldKind> for String {
    fn from(kind: FieldKind) -> Self {
        kind.to_string().to_lowercase()
    }
}

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
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
        sqlx::query_as!(
            FieldDefinition,
            "INSERT INTO field_definitions (kind, name) VALUES ($1, $2) RETURNING *",
            kind.to_string(),
            name
        )
        .fetch_one(&database.pool)
        .await
    }
}
