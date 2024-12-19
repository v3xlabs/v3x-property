use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};

use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub location_id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub root_location_id: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemLocation {
    pub item_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location_user_id: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location_item_id: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Location {
    pub async fn new(
        db: &Database,
        location_id: String,
        name: String,
        root_location_id: Option<String>,
    ) -> Result<Location, sqlx::Error> {
        query_as!(
            Location,
            "INSERT INTO locations (location_id, name, root_location_id) VALUES ($1, $2, $3) RETURNING *",
            location_id,
            name,
            root_location_id
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_id(db: &Database, location_id: &str) -> Result<Location, sqlx::Error> {
        query_as!(
            Location,
            "SELECT * FROM locations WHERE location_id = $1",
            location_id
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_all(db: &Database) -> Result<Vec<Location>, sqlx::Error> {
        query_as!(Location, "SELECT * FROM locations")
            .fetch_all(&db.pool)
            .await
    }

    pub async fn update(
        db: &Database,
        location_id: &str,
        name: &str,
    ) -> Result<Location, sqlx::Error> {
        query_as!(
            Location,
            "UPDATE locations SET name = $2 WHERE location_id = $1 RETURNING *",
            location_id,
            name
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_items_by_location_id(
        db: &Database,
        location_id: &str,
    ) -> Result<Vec<ItemLocation>, sqlx::Error> {
        query_as!(
            ItemLocation,
            "SELECT * FROM item_locations WHERE location_id = $1",
            location_id
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn get_items_by_user_id(
        db: &Database,
        user_id: i32,
    ) -> Result<Vec<ItemLocation>, sqlx::Error> {
        query_as!(
            ItemLocation,
            "SELECT * FROM item_locations WHERE location_user_id = $1",
            user_id
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn get_items_by_item_id(
        db: &Database,
        item_id: &str,
    ) -> Result<Vec<ItemLocation>, sqlx::Error> {
        query_as!(
            ItemLocation,
            "SELECT * FROM item_locations WHERE location_item_id = $1",
            item_id
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn get_by_item_id(
        db: &Database,
        item_id: &str,
    ) -> Result<Option<ItemLocation>, sqlx::Error> {
        query_as!(
            ItemLocation,
            "SELECT * FROM item_locations WHERE item_id = $1",
            item_id
        )
        .fetch_optional(&db.pool)
        .await
    }

    pub async fn get_by_root_location_id(
        db: &Database,
        root_location_id: &str,
    ) -> Result<Vec<Location>, sqlx::Error> {
        query_as!(Location, "SELECT * FROM locations WHERE root_location_id = $1", root_location_id)
            .fetch_all(&db.pool)
            .await
    }

    pub async fn update_item_location(
        db: &Database,
        item_id: &str,
        item_location: &ItemLocation,
    ) -> Result<Option<ItemLocation>, sqlx::Error> {
        query_as!(
            ItemLocation,
            "INSERT INTO item_locations (item_id, location_id, location_user_id, location_item_id) VALUES ($1, $2, $3, $4) ON CONFLICT (item_id) DO UPDATE SET location_id = $2, location_user_id = $3, location_item_id = $4 RETURNING *",
            item_id,
            item_location.location_id,
            item_location.location_user_id,
            item_location.location_item_id,
        )
        .fetch_optional(&db.pool)
        .await
    }
}
