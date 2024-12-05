use std::sync::Arc;

use poem::web::{Data, Query};
use poem::Result;
use poem_openapi::{payload::Json, OpenApi};
use tracing::info;

use super::ApiTags;
use crate::models::item::search::SearchableItem;
use crate::state::AppState;

pub mod tasks;

pub struct SearchApi;

// #[derive(Debug, Serialize, Deserialize, Object)]
// pub struct SearchResult {
//     pub id: i64,
//     pub title: String,
//     pub description: String,
// }

#[OpenApi]
impl SearchApi {
    /// /search
    ///
    /// Search for Items
    #[oai(path = "/search", method = "get", tag = "ApiTags::Search")]
    pub async fn search(
        &self,
        state: Data<&Arc<AppState>>,
        query: Query<String>,
    ) -> Json<Vec<SearchableItem>> {
        let search = state.search.as_ref().unwrap();

        let tasks = search
            .client
            .index("items")
            .search()
            .with_query(&query)
            .execute::<SearchableItem>()
            .await
            .unwrap();

        let results = tasks.hits.iter().map(|r| r.result.clone()).collect();

        Json(results)
    }

    /// /search/reindex
    ///
    /// Reindex all Items
    #[oai(path = "/search/reindex", method = "post", tag = "ApiTags::Search")]
    pub async fn reindex_all_items(&self, state: Data<&Arc<AppState>>) -> Result<()> {
        info!("Reindexing all items");

        state
            .search
            .as_ref()
            .unwrap()
            .index_all_items(&state.database)
            .await
            .unwrap();

        Ok(())
    }
}
