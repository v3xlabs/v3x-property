use poem::web::Data;
use poem::{Error, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use reqwest::StatusCode;
use tracing::info;

use super::ApiTags;
use crate::auth::middleware::AuthUser;
use crate::auth::permissions::Action;
use crate::routes::error::HttpError;
use crate::{models::search::SearchTask, state::AppState};

pub struct SearchTaskApi;

#[OpenApi]
impl SearchTaskApi {
    /// /search/tasks
    ///
    /// Get all Search Tasks
    #[oai(path = "/search/tasks", method = "get", tag = "ApiTags::Search")]
    pub async fn search_tasks(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
    ) -> Result<Json<Vec<SearchTask>>> {
        user.check_policy("search", None, Action::Read).await?;

        SearchTask::find_all(&state.database)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    /// /search/tasks/:task_id
    ///
    /// Refresh a Search Task by `task_id`
    #[oai(
        path = "/search/tasks/:task_id",
        method = "put",
        tag = "ApiTags::Search"
    )]
    pub async fn refresh_task(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        task_id: Path<i32>,
    ) -> Result<Json<SearchTask>> {
        user.check_policy("search", None, Action::Write).await?;

        info!("Refreshing task {}", task_id.0);

        match state.search.as_ref() {
            Some(search) => Ok(Json(
                search
                    .refresh_task(&state.database, task_id.0)
                    .await
                    .map_err(HttpError::from)?,
            )),
            None => Err(Error::from_status(StatusCode::METHOD_NOT_ALLOWED)),
        }
    }
}
