use std::{ops::Deref, str::FromStr};

use async_std::stream::StreamExt;
use openid::Userinfo;
use serde_json::Value;
use sqlx::{
    postgres::PgPoolOptions,
    query::{self, Query},
    types::Json,
    Execute, Executor, PgPool,
};
use tracing::info;
use uuid::Uuid;

use crate::{auth::session::SessionState, models::user_data::UserData};

#[derive(Debug)]
pub struct Database {
    pub pool: PgPool,
}

impl Database {
    pub async fn new(url: &str) -> Result<Self, sqlx::Error> {
        let pool = PgPoolOptions::new().max_connections(5).connect(url).await?;

        // Initialization code here
        let s = Self { pool };

        s.init().await?;

        Ok(s)
    }

    pub async fn init(&self) -> Result<(), sqlx::Error> {
        sqlx::migrate!().run(&self.pool).await?;

        Ok(())
    }

    /// Check if the user exists, return its info, otherwise create a new user, and return its info.
    pub async fn upsert_get_user(
        &self,
        oauth_userinfo: &Userinfo,
    ) -> Result<UserData, sqlx::Error> {
        let sub = oauth_userinfo.sub.as_deref().unwrap();

        info!("upsert_get_user: sub: {}", sub);

        sqlx::query_as::<_, UserData>(
            "INSERT INTO users (oauth_sub, oauth_data) VALUES ($1, $2) ON CONFLICT (oauth_sub) DO UPDATE SET oauth_data = $2 RETURNING *"
        )
            .bind(sub)
            .bind(Json(oauth_userinfo))
        .fetch_one(&self.pool).await
    }

    pub async fn get_user_from_id(&self, id: i32) -> Result<UserData, sqlx::Error> {
        let user = sqlx::query_as::<_, UserData>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_one(&self.pool)
            .await?;

        Ok(user)
    }

    pub async fn create_session(&self, user_id: i32, user_agent: &str) -> Result<SessionState, sqlx::Error> {
        let session = sqlx::query_as::<_, SessionState>("INSERT INTO sessions (user_id, user_agent) VALUES ($1, $2) RETURNING *")
            .bind(user_id)
            .bind(user_agent)
            .fetch_one(&self.pool)
            .await?;
        Ok(session)
    }

    pub async fn get_session_by_id(&self, id: Uuid) -> Result<SessionState, sqlx::Error> {
        let session = sqlx::query_as::<_, SessionState>("SELECT * FROM sessions WHERE id = $1 AND valid = TRUE")
            .bind(id)
            .fetch_one(&self.pool)
            .await?;

        Ok(session)
    }
}
