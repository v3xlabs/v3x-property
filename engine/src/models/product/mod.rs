use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as, FromRow};

use crate::{database::Database, modules::search::Search, routes::product::ProductUpdatePayload};

pub mod media;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub product_id: i32,
    pub name: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct ProductSlim {
    pub product_id: i32,
    pub name: String,
    pub primary_media_id: Option<i32>,
}

impl Product {
    pub async fn new(
        db: &Database,
        owner_id: Option<i32>,
        name: String,
    ) -> Result<Product, sqlx::Error> {
        query_as!(
            Product,
            "INSERT INTO products (name) VALUES ($1) RETURNING *",
            name
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_all(db: &Database) -> Result<Vec<Product>, sqlx::Error> {
        query_as!(Product, "SELECT * FROM products")
            .fetch_all(&db.pool)
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
    pub async fn get_products_slim(db: &Database) -> Result<Vec<ProductSlim>, sqlx::Error> {
        query_as!(
            ProductSlim,
            "SELECT p.product_id, p.name, pm.media_id AS primary_media_id
             FROM products p
             LEFT JOIN product_media pm ON p.product_id = pm.product_id
             GROUP BY p.product_id, p.name, pm.media_id
             ORDER BY pm.media_id ASC
             LIMIT 1"
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn edit_by_id(
        &self,
        search: &Option<Search>,
        db: &Database,
        data: &ProductUpdatePayload,
    ) -> Result<(), sqlx::Error> {
        todo!()
    }

    pub async fn delete(&self, search: &Option<Search>, db: &Database) -> Result<(), sqlx::Error> {
        // TODO: implement delete from search
        query!(
            "DELETE FROM products WHERE product_id = $1",
            self.product_id
        )
        .execute(&db.pool)
        .await?;

        Ok(())
    }

    pub async fn index_search(
        &self,
        search: &Option<Search>,
        db: &Database,
    ) -> Result<Product, sqlx::Error> {
        todo!()
    }
}
