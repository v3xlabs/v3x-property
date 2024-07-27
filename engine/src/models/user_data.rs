use openid::Userinfo;
use serde::{Deserialize, Serialize};
use sqlx::types::Json;

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct UserData {
    pub id: i32,
    pub oauth_sub: String,
    pub oauth_data: Json<Userinfo>,
    pub nickname: Option<String>,
}
