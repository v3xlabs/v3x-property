use futures::join;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::query_scalar;

use crate::state::AppState;

#[derive(Serialize, Deserialize, Object)]
pub struct InstanceStatistics {
    pub user_count: i64,
    pub item_count: i64,
    pub media_count: i64,
    pub log_count: i64,
}

impl InstanceStatistics {
    pub async fn load(state: &AppState) -> Self {
        let db = &state.database.pool;

        let (user_count, item_count, media_count, log_count) = join!(
            query_scalar("SELECT COUNT(*) FROM users").fetch_one(db),
            query_scalar("SELECT COUNT(*) FROM items").fetch_one(db),
            query_scalar("SELECT COUNT(*) FROM media").fetch_one(db),
            query_scalar("SELECT COUNT(*) FROM logs").fetch_one(db)
        );

        Self {
            user_count: user_count.unwrap_or(0),
            item_count: item_count.unwrap_or(0),
            media_count: media_count.unwrap_or(0),
            log_count: log_count.unwrap_or(0),
        }
    }
}

#[derive(Serialize, Deserialize, Object)]
pub struct StorageStatistics {
    pub bucket_file_count: u64,
    pub bucket_disk_size: u64,
}

impl StorageStatistics {
    pub async fn load(state: &AppState) -> Self {
        // query s3 to get total bucket size in bytes and store in bucket_disk_size
        // also list total files in bucket and store in bucket_file_count
        // state.storage.stat
        let storage = state.storage.stat_bucket().await.unwrap();

        StorageStatistics {
            bucket_file_count: storage.0,
            bucket_disk_size: storage.1,
        }
    }
}
