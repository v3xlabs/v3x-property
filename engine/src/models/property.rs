use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::types::chrono;

use crate::database::Database;

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Object, Default)]
pub struct Property {
    pub id: i32,
    pub owner_id: i32,
    pub product_id: i32,
    pub name: Option<String>,
    pub media: Option<Vec<i32>>,
    pub created: chrono::DateTime<chrono::Utc>,
    pub modified: chrono::DateTime<chrono::Utc>,
}

impl Property {
    pub async fn get_by_owner_id(
        owner_id: i32,
        database: &Database,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let properties = sqlx::query_as::<_, Self>("SELECT * FROM properties WHERE owner_id = $1")
            .bind(owner_id)
            .fetch_all(&database.pool)
            .await?;

        Ok(properties)
    }

    pub async fn get_by_id(id: i32, database: &Database) -> Result<Self, sqlx::Error> {
        let property = sqlx::query_as::<_, Self>("SELECT * FROM properties WHERE id = $1")
            .bind(id)
            .fetch_one(&database.pool)
            .await?;

        Ok(property)
    }
}
