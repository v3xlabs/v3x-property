use serde::{Deserialize, Serialize};
use sqlx::types::chrono;
use uuid::Uuid;

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct SessionState {
    pub id: Uuid,
    pub user_id: i32,
    pub user_agent: String,
    pub last_access: chrono::DateTime<chrono::Utc>,
    pub valid: bool,
}
