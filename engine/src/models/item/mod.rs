use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};
use tracing::info;

use crate::{database::Database, search::Search};

pub mod field;
pub mod media;
pub mod search;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub item_id: String,
    pub name: String,
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
            name: "A New Item".to_string(),
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
        name: String,
        owner_id: Option<i32>,
        location_id: Option<i32>,
        product_id: Option<i32>,
    ) -> Result<Item, sqlx::Error> {
        Self {
            item_id,
            name,
            owner_id,
            location_id,
            product_id,
            ..Default::default()
        }
        .insert(db).await
    }

    pub async fn insert(&self, db: &Database) -> Result<Item, sqlx::Error> {
        query_as!(Item, "INSERT INTO items (item_id, name, owner_id, location_id, product_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", self.item_id, self.name, self.owner_id, self.location_id, self.product_id)
            .fetch_one(&db.pool)
            .await
    }

    pub async fn get_by_owner_id(
        database: &Database,
        owner_id: i32
    ) -> Result<Vec<Item>, sqlx::Error> {
        query_as!(Item, "SELECT * FROM items WHERE owner_id = $1", owner_id)
            .fetch_all(&database.pool)
            .await
    }

    pub async fn get_by_id(db: &Database, item_id: String) -> Result<Option<Item>, sqlx::Error> {
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

    /// Shorthand for triggering a search index update.
    pub async fn index_search(&self, search: &Option<Search>, db: &Database) -> Result<Self, ()> {
        match search {
            Some(search) => {
                search.index_item(db, &self.into_search(db).await.unwrap()).await;
                Ok(self.to_owned())
            }
            None => Ok(self.to_owned()),
        }
    }

    pub async fn remove_search(&self, search: &Option<Search>, db: &Database) -> Result<Self, ()> {
        match search {
            Some(search) => {
                search.client.index("items").delete_document(&self.item_id).await;
                Ok(self.to_owned())
            }
            None => Ok(self.to_owned()),
        }
    }

    pub async fn delete(&self, search: &Option<Search>, db: &Database) -> Result<(), sqlx::Error> {
        self.remove_search(search, db).await;

        query("DELETE FROM items WHERE item_id = $1")
            .bind(&self.item_id)
            .execute(&db.pool)
            .await;

        Ok(())
    }
}
