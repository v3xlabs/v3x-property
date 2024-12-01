use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};
use tracing::info;

use crate::database::Database;

pub mod field;
pub mod media;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub item_id: String,
    pub name: Option<String>,
    pub product_id: Option<i32>,
    pub owner_id: Option<i32>,
    pub location_id: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Default for Item {
    fn default() -> Self {
        Item {
            item_id: "".to_string(),
            name: None,
            product_id: None,
            owner_id: None,
            location_id: None,
            created_at: Some(chrono::Utc::now()),
            updated_at: Some(chrono::Utc::now()),
        }
    }
}

impl Item {
    pub async fn new(
        db: &Database,
        item_id: String,
        name: Option<String>,
        owner_id: Option<i32>,
        location_id: Option<i32>,
        product_id: Option<i32>,
    ) -> Result<Item, sqlx::Error> {
        query_as!(
            Item,
            "INSERT INTO items (item_id, name, owner_id, location_id, product_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            item_id,
            name,
            owner_id,
            location_id,
            product_id
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_owner_id(
        owner_id: i32,
        database: &Database,
    ) -> Result<Vec<Item>, sqlx::Error> {
        query_as!(Item, "SELECT * FROM items WHERE owner_id = $1", owner_id)
            .fetch_all(&database.pool)
            .await
    }

    pub async fn get_by_id(
        db: &Database,
        item_id: String,
    ) -> Result<Option<Item>, sqlx::Error> {
        query_as!(Item, "SELECT * FROM items WHERE item_id = $1", item_id)
            .fetch_optional(&db.pool)
            .await
    }

    /// Item ids are string based, however generally we want to generate a numeric id.
    /// Start generation at 0, and check if the id is already taken.
    /// If it is, increment until we find an unused id.
    /// TODO: Implement resuming from the last id.
    pub async fn next_id(db: &Database) -> Result<String, sqlx::Error> {
        let mut id = 1;
        loop {
            let id_str = id.to_string();
            info!("Checking if id {} is taken", id_str);
            if query("SELECT 1 FROM items WHERE item_id = $1")
                .bind(id_str.clone())
                .fetch_optional(&db.pool)
                .await
                .unwrap()
                .is_none()
            {
                return Ok(id_str);
            }
            id += 1;
        }
    }
}
