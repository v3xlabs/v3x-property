use openid::Userinfo;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::types::Json;
use url::Url;

use crate::database::Database;

#[derive(Deserialize, Serialize, Clone, Debug)]
struct Person {
    name: String,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct UserEntry {
    pub user_id: i32,
    pub oauth_sub: String,
    pub oauth_data: Json<Person>,
    pub nickname: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl UserEntry {
    pub fn is_system(&self) -> bool {
        self.oauth_sub == "$$SYSTEM$$"
    }

    pub async fn create(
        oauth_userinfo: &Userinfo,
        nickname: Option<String>,
        database: &Database,
    ) -> Result<UserEntry, sqlx::Error> {
        let oauth_sub = oauth_userinfo.sub.as_deref().unwrap();

        let person = Person {
            name: "test".to_string(),
        };

        sqlx::query_as!(
            UserEntry,
            "INSERT INTO users (oauth_sub, oauth_data, nickname) VALUES ($1, $2, $3) RETURNING *",
            oauth_sub,
            Value(person),
            nickname
        )
        .fetch_one(&database.pool)
        .await
    }

    pub async fn find_by_oauth_sub(
        oauth_sub: String,
        database: &Database,
    ) -> Result<Option<UserEntry>, sqlx::Error> {
        sqlx::query_as!(
            UserEntry,
            "SELECT * FROM users WHERE oauth_sub = $1",
            oauth_sub
        )
        .fetch_optional(&database.pool)
        .await
    }

    pub async fn find_by_user_id(
        user_id: i32,
        database: &Database,
    ) -> Result<Option<UserEntry>, sqlx::Error> {
        sqlx::query_as!(UserEntry, "SELECT * FROM users WHERE user_id = $1", user_id)
            .fetch_optional(&database.pool)
            .await
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, poem_openapi::Object)]
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
