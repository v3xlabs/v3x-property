use poem::web::Data;
use poem::Result;
use poem_openapi::param::Query;
use poem_openapi::{payload::Json, OpenApi};
use tracing::info;

use super::error::HttpError;
use super::ApiTags;
use crate::auth::middleware::AuthUser;
use crate::auth::permissions::Action;
use crate::models::item::search::SearchableItem;
use crate::state::AppState;

pub mod tasks;

pub struct SearchApi;

#[OpenApi]
impl SearchApi {
    /// /search
    ///
    /// Search for Items
    #[oai(path = "/search", method = "get", tag = "ApiTags::Search")]
    pub async fn search(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        query: Query<Option<String>>,
    ) -> Result<Json<Vec<SearchableItem>>> {
        user.check_policy("search", None, Action::Read).await?;

        let search = state.search.as_ref().unwrap();

        let tasks = search
            .client
            .index("items")
            .search()
            .with_query(&query.0.unwrap_or_default())
            // TODO: Re-enable hybrid search when more stable
            // .with_hybrid("ollama", 0.9)
            .execute::<SearchableItem>()
            .await
            .map_err(HttpError::from)?;

        let results = tasks.hits.iter().map(|r| r.result.clone()).collect();

        Ok(Json(results))
    }

    /// /search/reindex
    ///
    /// Reindex all Items
    #[oai(path = "/search/reindex", method = "post", tag = "ApiTags::Search")]
    pub async fn reindex_all_items(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
    ) -> Result<()> {
        // TODO: change to search
        user.check_policy("search", None, Action::Write).await?;

        info!("Reindexing all items");

        state
            .search
            .as_ref()
            .unwrap()
            .index_all_items(&state.database)
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }
}
