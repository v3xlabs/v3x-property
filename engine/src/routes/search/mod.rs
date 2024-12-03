use std::sync::Arc;

use poem::web::{Data, Query};
use poem::Result;
use poem_openapi::Object;
use poem_openapi::{payload::Json, OpenApi};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::models::item::search::SearchableItem;
use crate::state::AppState;

pub mod tasks;

pub struct SearchApi;

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct SearchQueryParams {
    pub query: String,
}

// #[derive(Debug, Serialize, Deserialize, Object)]
// pub struct SearchResult {
//     pub id: i64,
//     pub title: String,
//     pub description: String,
// }

#[OpenApi]
impl SearchApi {
    #[oai(path = "/search", method = "get")]
    pub async fn search(
        &self,
        state: Data<&Arc<AppState>>,
        query: Query<SearchQueryParams>,
    ) -> Json<Vec<SearchableItem>> {
        let search = state.search.as_ref().unwrap();

        let tasks = search
            .client
            .index("items")
            .search()
            .with_query(&query.query)
            .execute::<SearchableItem>()
            .await
            .unwrap();

        let results = tasks.hits.iter().map(|r| r.result.clone()).collect();

        Json(results)
    }

    #[oai(path = "/search/index", method = "post")]
    pub async fn index_all_items(&self, state: Data<&Arc<AppState>>) -> Result<()> {
        info!("Indexing all items");
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
