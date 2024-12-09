use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{payload::Json, OpenApi};

use super::ApiTags;
use crate::{
    auth::{middleware::AuthToken, permissions::Action},
    models::log::LogEntry,
    state::AppState,
};

pub struct LogsApi;

#[OpenApi]
impl LogsApi {
    /// /logs
    ///
    /// Get all logs
    #[oai(path = "/logs", method = "get", tag = "ApiTags::Logs")]
    async fn get_all_logs(
        &self,
        user: AuthToken,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<LogEntry>>> {
        user.check_policy("log", None, Action::Read).await?;

        Ok(Json(LogEntry::get_all(&state.database).await.unwrap()))
    }
}
