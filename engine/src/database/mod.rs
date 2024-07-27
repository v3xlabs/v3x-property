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

use crate::models::user_data::UserData;

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

        match sqlx::query_as::<_, UserData>("SELECT * FROM users WHERE oauth_sub = $1")
            .bind(sub)
            .fetch_one(&self.pool)
            .await
        {
            Ok(x) => {
                info!("upsert_get_user_found: {:?}", x);
                Ok(x)
            }
            Err(e) => {
                info!("upsert_get_user: not found {}", e);

                let mut local_userdata = UserData {
                    id: 0,
                    oauth_sub: sub.to_string(),
                    oauth_data: Json(oauth_userinfo.clone()),
                    nickname: None,
                };

                let insert_query = sqlx::query!(
                    "INSERT INTO users (oauth_sub, oauth_data) VALUES ($1, $2) RETURNING id",
                    local_userdata.oauth_sub,
                    Json(&oauth_userinfo) as _
                )
                .fetch_one(&self.pool)
                .await?;

                info!("upsert_get_user: {:?}", insert_query);

                local_userdata.id = insert_query.id;

                Ok(local_userdata)
            }
        }
    }

    // pub async fn insert_user(&self, user: &Userinfo) -> Result<u64, sqlx::Error> {
    //     let x = self
    //         .pool
    //         .execute(
    //             sqlx::query!(
    //                 "INSERT INTO users (id, email, name, picture, locale, timezone) VALUES ($1, $2, $3, $4, $5, $6)",

    //            )
    //         )
    //         .await?;

    //     Ok(x.rows_affected())
    // }
}
