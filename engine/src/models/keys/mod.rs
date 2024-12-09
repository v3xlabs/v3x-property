use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::{prelude::FromRow, query, query_as};
use uuid::Uuid;

use crate::database::Database;

#[derive(Debug, Serialize, Deserialize, FromRow, Object, Clone)]
pub struct UserApiKey {
    pub token_id: i32,
    pub user_id: i32,
    pub name: String,
    pub token: String,
    pub permissions: String,
}

impl UserApiKey {
    pub fn hash_token(token: &str) -> String {
        let mut sha256 = Sha256::new();
        sha256.update(token.as_bytes());
        hex::encode(sha256.finalize())
    }

    pub async fn new(
        db: &Database,
        user_id: i32,
        name: &str,
        permissions: &str,
    ) -> Result<(Self, String), sqlx::Error> {
        let token = Self::hash_token(Uuid::new_v4().to_string().as_str());

        // grab its first 16 characters
        let token = token[..16].to_string();

        let hashed_token = Self::hash_token(&token);
        let selfs = query_as!(Self,
            "INSERT INTO api_keys (user_id, name, token, permissions) VALUES ($1, $2, $3, $4) RETURNING *",
             user_id, name, hashed_token, permissions)
            .fetch_one(&db.pool).await?;

        Ok((selfs, token))
    }

    pub async fn find_by_user_id(user_id: i32, db: &Database) -> Result<Vec<Self>, sqlx::Error> {
        query_as!(Self, "SELECT * FROM api_keys WHERE user_id = $1", user_id)
            .fetch_all(&db.pool)
            .await
    }

    pub async fn delete_by_token_id(token_id: i32, db: &Database) -> Result<(), sqlx::Error> {
        query!("DELETE FROM api_keys WHERE token_id = $1", token_id)
            .execute(&db.pool)
            .await
            .map(|_| ())
    }

    pub async fn find_by_token(db: &Database, token: &str) -> Result<Option<Self>, sqlx::Error> {
        let hashed_token = Self::hash_token(token);
        query_as!(Self, "SELECT * FROM api_keys WHERE token = $1", hashed_token)
            .fetch_optional(&db.pool)
            .await
    }
}
