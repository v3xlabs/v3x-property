use std::sync::Arc;

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
    pub async fn load(state: &Arc<AppState>) -> Self {
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
