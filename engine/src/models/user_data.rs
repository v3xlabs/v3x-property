use serde::{Deserialize, Serialize};


#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct UserData {
    pub id: i64,
    pub oauth_sub: String,
    pub oauth_data: Option<String>,
    pub nickname: Option<String>,
}
