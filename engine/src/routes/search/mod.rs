use std::sync::Arc;

use meilisearch_sdk::search::SearchQuery;
use poem::web::{Data, Path, Query};
use poem::{Error, Result};
use poem_openapi::Object;
use poem_openapi::{payload::Json, OpenApi};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::models::item::search::SearchableItem;
use crate::models::item::Item;
use crate::{models::search::SearchTask, state::AppState};

pub mod tasks;

pub struct ApiSearch;

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
impl ApiSearch {
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
}
