use serde::{Deserialize, Serialize};
use sqlx::Type;
use poem_openapi::Enum;

#[derive(Type, Enum, Debug, Clone, Serialize, Deserialize)]
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
        write!(f, "{:?}", self)
    }
}

impl FieldKind {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "string" => FieldKind::String,
            "number" => FieldKind::Number,
            "boolean" => FieldKind::Boolean,
            "json" => FieldKind::Json,
            _ => FieldKind::String,
        }
    }
}

impl From<String> for FieldKind {
    fn from(s: String) -> Self {
        FieldKind::from_str(&s)
    }
}

impl From<FieldKind> for String {
    fn from(kind: FieldKind) -> Self {
        kind.to_string().to_lowercase()
    }
}