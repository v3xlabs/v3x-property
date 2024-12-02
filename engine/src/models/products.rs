use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};

use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub product_id: i32,
    pub name: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Product {
    pub async fn new(db: &Database, name: String) -> Result<Product, sqlx::Error> {
        query_as!(
            Product,
            "INSERT INTO products (name) VALUES ($1) RETURNING *",
            name
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_id(db: &Database, product_id: i32) -> Result<Option<Product>, sqlx::Error> {
        query_as!(
            Product,
            "SELECT * FROM products WHERE product_id = $1",
            product_id
        )
        .fetch_optional(&db.pool)
        .await
    }
}
