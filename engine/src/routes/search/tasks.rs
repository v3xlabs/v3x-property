use std::sync::Arc;

use poem::web::{Data, Path};
use poem::{Error, Result};
use poem_openapi::{payload::Json, OpenApi};
use reqwest::StatusCode;
use tracing::info;


use crate::{models::search::SearchTask, state::AppState};
use super::ApiTags;

pub struct SearchTaskApi;

#[OpenApi]
impl SearchTaskApi {
    /// /search/tasks
    /// 
    /// Get all Search Tasks
    #[oai(path = "/search/tasks", method = "get", tag = "ApiTags::Search")]
    pub async fn search_tasks(&self, state: Data<&Arc<AppState>>) -> Json<Vec<SearchTask>> {
        let tasks = SearchTask::find_all(&state.database).await.unwrap();

        Json(tasks)
    }

    /// /search/tasks/:task_id
    /// 
    /// Refresh a Search Task by `task_id`
    #[oai(path = "/search/tasks/:task_id", method = "put", tag = "ApiTags::Search")]
    pub async fn refresh_task(
        &self,
        state: Data<&Arc<AppState>>,
        task_id: Path<i32>,
    ) -> Result<Json<SearchTask>> {
        info!("Refreshing task {}", task_id.0);

        match state.search.as_ref() {
            Some(search) => Ok(Json(
                search
                    .refresh_task(&state.database, task_id.0)
                    .await
                    .unwrap(),
            )),
            None => Err(Error::from_status(StatusCode::METHOD_NOT_ALLOWED)),
        }
    }
}
