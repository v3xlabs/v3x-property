use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{payload::Json, OpenApi};
use reqwest::StatusCode;

use super::ApiTags;
use crate::{auth::middleware::AuthToken, models::log::LogEntry, state::AppState};

pub struct LogsApi;

#[OpenApi]
impl LogsApi {
    /// /logs
    ///
    /// Get all logs
    #[oai(path = "/logs", method = "get", tag = "ApiTags::Logs")]
    async fn get_all_logs(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<LogEntry>>> {
        match auth.ok() {
            Some(user) => Ok(Json(LogEntry::get_all(&state.database).await.unwrap())),
            None => Err(StatusCode::UNAUTHORIZED.into()),
        }
    }
}
