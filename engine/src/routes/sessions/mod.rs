use std::sync::Arc;

use poem::{web::Data, Error, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use reqwest::StatusCode;
use tracing::info;

use super::ApiTags;
use crate::{auth::middleware::AuthToken, models::sessions::Session, state::AppState};
// pub mod delete;

pub struct SessionsApi;

#[OpenApi]
impl SessionsApi {
    /// /sessions
    ///
    /// Get all sessions for the current user
    #[oai(path = "/sessions", method = "get", tag = "ApiTags::Auth")]
    async fn get_sessions(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<Session>>> {
        let active_user = auth
            .ok()
            .ok_or(Error::from_status(StatusCode::UNAUTHORIZED))?;

        Ok(Json(
            Session::get_by_user_id(&state.database, active_user.session.user_id)
                .await
                .unwrap(),
        ))
    }

    /// /sessions/:session_id
    ///
    /// Delete a Session by `session_id`
    #[oai(
        path = "/sessions/:session_id",
        method = "delete",
        tag = "ApiTags::Auth"
    )]
    async fn delete_session(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        session_id: Path<String>,
    ) -> poem_openapi::payload::Json<Vec<Session>> {
        match auth {
            AuthToken::Active(active_user, _) => {
                info!("Deleting session {:?}", session_id.0);

                let sessions = Session::invalidate_by_id(
                    &state.database,
                    active_user.session.user_id,
                    &session_id.0,
                )
                .await
                .unwrap();

                Json(sessions)
            }
            _ => Json(vec![]),
            // _ => Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
        }
    }
}
