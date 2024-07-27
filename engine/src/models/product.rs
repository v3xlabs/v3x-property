use poem_openapi::Object;
use serde::{Deserialize, Serialize};

use crate::database::Database;

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Object, Default)]
pub struct Product {
    /// Cherry Picked Identifier
    pub id: i32,
    /// Name of the product
    pub name: String,
    /// Media associated with the product
    pub media: Vec<i32>,
    /// Tweakers ID
    pub tweakers_id: Option<Vec<i32>>,
    /// EANs
    pub ean: Option<Vec<String>>,
    /// UPCs
    pub upc: Option<Vec<String>>,
    /// SKUs
    pub sku: Option<Vec<String>>,
}

impl Product {
    pub async fn get_by_id(id: i32, database: &Database) -> Result<Self, sqlx::Error> {
        let product = sqlx::query_as::<_, Self>("SELECT * FROM products WHERE id = $1")
            .bind(id)
            .fetch_one(&database.pool)
            .await?;

        Ok(product)
    }
}
