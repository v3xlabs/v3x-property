use chrono::{DateTime, Utc};
use field::ItemField;
use media::ItemMedia;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};
use tracing::info;

use super::{log::LogEntry, settings::InstanceSettings};
use crate::{
    database::Database,
    modules::search::Search,
    routes::item::{ItemUpdateMediaStatus, ItemUpdatePayload},
    state::AppState,
};

pub mod field;
pub mod media;
pub mod search;

#[derive(sqlx::FromRow, poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub item_id: String,
    pub name: String,
    pub product_id: Option<i32>,
    pub owner_id: Option<i32>,
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
        product_id: Option<i32>,
    ) -> Result<Item, sqlx::Error> {
        Self {
            item_id,
            name,
            owner_id,
            product_id,
            ..Default::default()
        }
        .insert(db)
        .await
    }

    pub async fn insert(&self, db: &Database) -> Result<Item, sqlx::Error> {
        let item = query_as!(Item, "INSERT INTO items (item_id, name, owner_id, product_id) VALUES ($1, $2, $3, $4) RETURNING *", self.item_id, self.name, self.owner_id, self.product_id)
            .fetch_one(&db.pool)
            .await?;

        LogEntry::new(
            db,
            "item",
            &item.item_id,
            item.owner_id.unwrap_or(1),
            "create",
            serde_json::to_string(&item).unwrap().as_str(),
        )
        .await;

        Ok(item)
    }

    pub async fn get_all(db: &Database) -> Result<Vec<Item>, sqlx::Error> {
        query_as!(Item, "SELECT * FROM items")
            .fetch_all(&db.pool)
            .await
    }

    // get all items from items table paginated by size, ordered by updated_at DESC if recent_first is true, otherwise ASC
    // if tags is None, return all items
    // if tags is Some, return all items that have all of the tags
    // check wether an item has a tag by checking the items_to_tags table
    // if tags is Some, add a WHERE clause to the query to filter items by tags
    pub async fn get_filtered(
        db: &Database,
        tags: Option<Vec<i32>>,
        recent_first: bool,
        size: i32,
    ) -> Result<Vec<Item>, sqlx::Error> {
        let tags = tags.and_then(|x| if x.is_empty() { None } else { Some(x) });

        let base_query = match tags.clone() {
            Some(tags) => {
                let placeholders: Vec<String> = (1..=tags.len())
                    .map(|i| format!("${}", i))
                    .collect();
                format!(
                    "SELECT DISTINCT i.* FROM items i 
                    INNER JOIN items_to_tags itt ON i.item_id = itt.item_id 
                    WHERE itt.tag_id IN ({}) 
                    GROUP BY i.item_id 
                    HAVING COUNT(DISTINCT itt.tag_id) = ${}
                    ORDER BY i.updated_at {} 
                    LIMIT ${}",
                    placeholders.join(","),
                    tags.len() + 1,
                    if recent_first { "DESC" } else { "ASC" },
                    tags.len() + 2
                )
            }
            None => format!(
                "SELECT * FROM items ORDER BY updated_at {} LIMIT $1",
                if recent_first { "DESC" } else { "ASC" }
            ),
        };

        match tags {
            Some(tags) => {
                let mut query = sqlx::query_as(&base_query);
                // Bind all tag parameters
                for tag in tags.iter() {
                    query = query.bind(tag);
                }
                // Bind the tag count for HAVING clause
                query = query.bind(tags.len() as i64);
                // Bind the LIMIT parameter
                query = query.bind(size);
                query.fetch_all(&db.pool).await
            }
            None => {
                sqlx::query_as(&base_query)
                    .bind(size)
                    .fetch_all(&db.pool)
                    .await
            }
        }
    }

    pub async fn get_by_owner_id(
        database: &Database,
        owner_id: i32,
    ) -> Result<Vec<Item>, sqlx::Error> {
        query_as!(
            Item,
            "SELECT * FROM items WHERE owner_id = $1 ORDER BY updated_at DESC",
            owner_id
        )
        .fetch_all(&database.pool)
        .await
    }

    pub async fn get_by_id(db: &Database, item_id: &str) -> Result<Option<Item>, sqlx::Error> {
        query_as!(Item, "SELECT * FROM items WHERE item_id = $1", item_id)
            .fetch_optional(&db.pool)
            .await
    }

    /// Item ids are string based, however generally we want to generate a numeric id.
    /// Start generation at 0, and check if the id is already taken.
    /// If it is, increment until we find an unused id.
    /// TODO: Implement resuming from the last id.
    pub async fn next_id(state: &AppState) -> Result<String, sqlx::Error> {
        let initial_id = InstanceSettings::get_last_item_id(&state.database)
            .await
            .unwrap();
        let mut id = initial_id;

        loop {
            let id_str = id.to_string();
            info!("Checking if id {} is taken", id_str);
            if query("SELECT 1 FROM items WHERE item_id = $1")
                .bind(id_str.clone())
                .fetch_optional(&state.database.pool)
                .await
                .unwrap()
                .is_none()
            {
                if id != initial_id {
                    InstanceSettings::update_last_item_id(&state.database, id - 1).await;
                }

                return Ok(id_str);
            }
            id += 1;
        }
    }

    /// Shorthand for triggering a search index update.
    pub async fn index_search(
        &self,
        search: &Option<Search>,
        db: &Database,
    ) -> Result<Self, anyhow::Error> {
        match search {
            Some(search) => {
                search
                    .index_item(db, &self.into_search(db).await.unwrap())
                    .await
                    .unwrap();
                Ok(self.to_owned())
            }
            None => Ok(self.to_owned()),
        }
    }

    pub async fn remove_search(&self, search: &Option<Search>, _db: &Database) -> Result<Self, ()> {
        match search {
            Some(search) => {
                let _ = search
                    .client
                    .index("items")
                    .delete_document(&self.item_id)
                    .await;
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

    pub async fn edit_by_id(
        search: &Option<Search>,
        db: &Database,
        data: &ItemUpdatePayload,
        item_id: &str,
    ) -> Result<Item, sqlx::Error> {
        let mut tx = db.pool.begin().await?;

        if let Some(name) = &data.name {
            query!(
                "UPDATE items SET name = $1 WHERE item_id = $2",
                name,
                item_id
            )
            .execute(&mut *tx)
            .await?;
        }

        if let Some(owner_id) = data.owner_id {
            query!(
                "UPDATE items SET owner_id = $1 WHERE item_id = $2",
                owner_id,
                item_id
            )
            .execute(&mut *tx)
            .await?;
        }

        // TODO: location_id
        // if let Some(location_id) = data.location_id {
        //     query!(
        //         "UPDATE items SET location_id = $1 WHERE item_id = $2",
        //         location_id,
        //         item_id
        //     )
        //     .execute(&mut *tx)
        //     .await?;
        // }

        if let Some(product_id) = data.product_id {
            query!(
                "UPDATE items SET product_id = $1 WHERE item_id = $2",
                product_id,
                item_id
            )
            .execute(&mut *tx)
            .await?;
        }

        if let Some(tags) = &data.tags {
            query!("DELETE FROM items_to_tags WHERE item_id = $1", item_id)
                .execute(&mut *tx)
                .await?;

            for tag in tags {
                query!(
                    "INSERT INTO items_to_tags (item_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    item_id,
                    tag
                )
                .execute(&mut *tx)
                .await?;
            }
        }

        if let Some(media) = &data.media {
            for media in media {
                match media.status {
                    ItemUpdateMediaStatus::Existing => {
                        // nothing needed here
                    }
                    ItemUpdateMediaStatus::New => {
                        ItemMedia::new(db, item_id, media.media_id).await.unwrap();
                    }
                    ItemUpdateMediaStatus::Removed => {
                        ItemMedia::delete(db, item_id, media.media_id)
                            .await
                            .unwrap();
                    }
                }
            }
        }

        if let Some(fields) = &data.fields {
            for field in fields {
                if field.value.is_null() {
                    info!(
                        "Deleting field {} for item {}",
                        field.definition_id, item_id
                    );
                    ItemField::delete(db, item_id, &field.definition_id)
                        .await
                        .unwrap();
                } else {
                    info!(
                        "Upserting field {} for item {}",
                        field.definition_id, item_id
                    );
                    ItemField::upsert(db, item_id, &field.definition_id, &field.value)
                        .await
                        .unwrap();
                }
            }
        }

        // bump updated_at field
        query!(
            "UPDATE items SET updated_at = NOW() WHERE item_id = $1",
            item_id
        )
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        let item = Item::get_by_id(db, item_id).await.unwrap().unwrap();

        if let Some(search) = search {
            let search_item = item.into_search(db).await.unwrap();

            search.index_item(db, &search_item).await.unwrap();
        }

        Ok(item)
    }
}
