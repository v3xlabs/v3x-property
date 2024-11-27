use serde::{Deserialize, Serialize};
use sqlx::prelude::*;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub product_id: i32,
    pub name: String,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl Product {
    pub async fn create(name: String, database: &Database) -> Result<Product, sqlx::Error> {
        sqlx::query_as!(
            Product,
            "INSERT INTO products (name) VALUES ($1) RETURNING *",
            name
        )
        .fetch_one(&database.pool)
        .await
    }
}
