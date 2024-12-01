use std::sync::Arc;

use poem::web::{Data, Path};
use poem::{Error, Result};
use poem_openapi::{payload::Json, OpenApi};
use reqwest::StatusCode;
use tracing::info;

use crate::{models::search::SearchTask, state::AppState};

pub struct ApiSearchTask;

#[OpenApi]
impl ApiSearchTask {
    #[oai(path = "/search/tasks", method = "get")]
    pub async fn search_tasks(&self, state: Data<&Arc<AppState>>) -> Json<Vec<SearchTask>> {
        let tasks = SearchTask::find_all(&state.database).await.unwrap();

        Json(tasks)
    }

    #[oai(path = "/search/tasks/:external_task_id", method = "put")]
    pub async fn refresh_task(
        &self,
        state: Data<&Arc<AppState>>,
        external_task_id: Path<i64>,
    ) -> Result<Json<SearchTask>> {
        info!("Refreshing task {}", external_task_id.0);

        match state.search.as_ref() {
            Some(search) => Ok(Json(
                search
                    .refresh_task(&state.database, external_task_id.0)
                    .await
                    .unwrap(),
            )),
            None => Err(Error::from_status(StatusCode::METHOD_NOT_ALLOWED)),
        }
    }
}
