use openid::Userinfo;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::types::Json;
use tracing::info;
use url::Url;

use crate::database::Database;

#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct User {
    pub id: i32,
    pub oauth_sub: String,
    pub name: String,
    pub picture: Option<Url>,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct UserEntry {
    pub id: i32,
    pub oauth_sub: String,
    pub oauth_data: Json<Userinfo>,
    pub nickname: Option<String>,
}

impl UserEntry {
    pub async fn new(oauth_userinfo: &Userinfo, database: &Database) -> Result<Self, sqlx::Error> {
        let sub = oauth_userinfo.sub.as_deref().unwrap();

        info!("Initializing new User {:?}", oauth_userinfo.sub);

        sqlx::query_as::<_, Self>(
            "INSERT INTO users (oauth_sub, oauth_data) VALUES ($1, $2) ON CONFLICT (oauth_sub) DO UPDATE SET oauth_data = $2 RETURNING *"
        )
            .bind(sub)
            .bind(Json(oauth_userinfo))
        .fetch_one(&database.pool).await
    }

    pub async fn get_by_id(id: i32, database: &Database) -> Result<Self, sqlx::Error> {
        let user = sqlx::query_as::<_, Self>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_one(&database.pool)
            .await?;

        Ok(user)
    }
}

impl From<UserEntry> for User {
    fn from(user: UserEntry) -> Self {
        Self {
            id: user.id,
            oauth_sub: user.oauth_sub,
            name: user
                .nickname
                .or(user.oauth_data.nickname.clone())
                .or(user.oauth_data.name.clone())
                .unwrap_or("Unknown".to_string()),
            picture: user.oauth_data.picture.clone(),
        }
    }
}
