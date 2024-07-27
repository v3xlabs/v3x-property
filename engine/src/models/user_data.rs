use openid::Userinfo;
use serde::{Deserialize, Serialize};
use sqlx::types::Json;
use tracing::info;

use crate::database::Database;

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct UserData {
    pub id: i32,
    pub oauth_sub: String,
    pub oauth_data: Json<Userinfo>,
    pub nickname: Option<String>,
}

impl UserData {
    pub async fn new(oauth_userinfo: &Userinfo, database: &Database) -> Result<Self, sqlx::Error> {
        let sub = oauth_userinfo.sub.as_deref().unwrap();

        info!("Initializing new User {:?}", oauth_userinfo);

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
