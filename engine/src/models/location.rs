use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, FromRow};

use crate::database::Database;

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub location_id: String,
    pub name: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Location {
    pub async fn new(db: &Database, location_id: String, name: String) -> Result<Location, sqlx::Error> {
        query_as!(
            Location,
            "INSERT INTO locations (location_id, name) VALUES ($1, $2) RETURNING *",
            location_id,
            name
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_id(db: &Database, location_id: &str) -> Result<Location, sqlx::Error> {
        query_as!(Location, "SELECT * FROM locations WHERE location_id = $1", location_id)
            .fetch_one(&db.pool)
            .await
    }

    pub async fn get_all(db: &Database) -> Result<Vec<Location>, sqlx::Error> {
        query_as!(Location, "SELECT * FROM locations")
            .fetch_all(&db.pool)
            .await
    }

    pub async fn update(db: &Database, location_id: &str, name: &str) -> Result<Location, sqlx::Error> {
        query_as!(Location, "UPDATE locations SET name = $2 WHERE location_id = $1 RETURNING *", location_id, name)
            .fetch_one(&db.pool)
            .await
    }
}
