use async_std::stream::StreamExt;
use openid::Userinfo;
use sqlx::{
    postgres::PgPoolOptions,
    query::{self, Query},
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

    pub async fn upsert_get_user(&self, oauth_userinfo: &Userinfo) -> Result<UserData, sqlx::Error> {
        // Check if the user exists, return its info, otherwise create a new user, and return its info.

        let sub = oauth_userinfo.sub.as_ref().unwrap().to_string();

        let mut userdata =
            sqlx::query_as::<_, UserData>("SELECT * FROM users WHERE oauth_sub = ? LIMIT 1")
                .bind(sub)
                .fetch(&self.pool);

        let x = userdata.next().await.unwrap().unwrap();

        info!("upsert_get_user: {:?}", x);

        Ok(x)
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
