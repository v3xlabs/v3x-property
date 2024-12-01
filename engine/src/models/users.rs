use openid::Userinfo;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as, types::Json, FromRow};
use url::Url;
use chrono::{DateTime, Utc};
use poem_openapi::Object;
use crate::database::Database;

/// A user object that is stored in the database
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct UserEntry {
    pub user_id: i32,
    pub oauth_sub: String,
    pub oauth_data: Json<Userinfo>,
    pub nickname: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl UserEntry {
    pub fn is_system(&self) -> bool {
        self.oauth_sub == "$$SYSTEM$$"
    }

    pub async fn upsert(
        oauth_userinfo: &Userinfo,
        nickname: Option<String>,
        database: &Database,
    ) -> Result<UserEntry, sqlx::Error> {
        let oauth_sub = oauth_userinfo.sub.as_deref().unwrap();
        let oauth_data_json: Json<Userinfo> = Json(oauth_userinfo.clone());

        // upsert into users table and select the result
        query("INSERT INTO users (oauth_sub, oauth_data, nickname) VALUES ($1, $2, $3) ON CONFLICT (oauth_sub) DO UPDATE SET oauth_data = $2, nickname = $3 RETURNING user_id, oauth_sub, oauth_data, nickname, created_at, updated_at")
            .bind(oauth_sub)
            .bind(oauth_data_json)
            .bind(nickname)
            .fetch_one(&database.pool)
            .await
            .map(|x| UserEntry::from_row(&x).unwrap())
    }

    pub async fn find_by_oauth_sub(
        oauth_sub: String,
        database: &Database,
    ) -> Result<Option<UserEntry>, sqlx::Error> {
        query_as!(
            UserEntry,
            r#"SELECT user_id, oauth_sub, oauth_data::text::json as "oauth_data!: Json<Userinfo>", 
            nickname, created_at, updated_at FROM users WHERE oauth_sub = $1"#,
            oauth_sub
        )
        .fetch_optional(&database.pool)
        .await
    }

    pub async fn find_by_user_id(
        user_id: i32,
        database: &Database,
    ) -> Result<Option<UserEntry>, sqlx::Error> {
        query_as!(
            UserEntry,
            r#"SELECT user_id, oauth_sub, oauth_data::text::json as "oauth_data!: Json<Userinfo>", 
            nickname, created_at, updated_at FROM users WHERE user_id = $1"#,
            user_id
        )
        .fetch_optional(&database.pool)
        .await
    }
}

/// A user object that is returned to the client
/// This is a subset of the `UserEntry` struct
/// Use `UserEntry` to query the database for a user
#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct User {
    pub id: i32,
    pub oauth_sub: String,
    pub name: String,
    pub picture: Option<Url>,
}

impl From<UserEntry> for User {
    fn from(user: UserEntry) -> Self {
        Self {
            id: user.user_id,
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
