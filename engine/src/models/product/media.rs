use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};

use crate::database::Database;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ProductMedia {
    pub product_id: i32,
    pub media_id: i32,
}

impl ProductMedia {
    pub async fn new(
        db: &Database,
        product_id: &i32,
        media_id: i32,
    ) -> Result<ProductMedia, sqlx::Error> {
        query_as!(
            ProductMedia,
            "INSERT INTO product_media (product_id, media_id) VALUES ($1, $2) RETURNING *",
            product_id,
            media_id
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn delete(db: &Database, product_id: &i32, media_id: i32) -> Result<(), sqlx::Error> {
        query!(
            "DELETE FROM product_media WHERE product_id = $1 AND media_id = $2",
            product_id,
            media_id
        )
        .execute(&db.pool)
        .await?;

        Ok(())
    }

    pub async fn get_by_product_id(
        db: &Database,
        product_id: &i32,
    ) -> Result<Vec<ProductMedia>, sqlx::Error> {
        query_as!(ProductMedia, "SELECT * FROM product_media WHERE product_id = $1", product_id)
            .fetch_all(&db.pool)
            .await
    }
}
