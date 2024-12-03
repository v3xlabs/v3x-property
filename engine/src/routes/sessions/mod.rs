use std::sync::Arc;

use poem::{web::{Data, Path}, Error, Result};
use poem_openapi::{payload::Json, OpenApi};
use reqwest::StatusCode;
use tracing::info;

use crate::{auth::middleware::AuthToken, models::sessions::Session, state::AppState};

pub mod delete;

pub struct SessionsApi;

#[OpenApi]
impl SessionsApi {
    #[oai(path = "/sessions", method = "get")]
    async fn get_sessions(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<Session>>> {
        let active_user = auth.ok().ok_or(Error::from_status(StatusCode::UNAUTHORIZED))?;

        Ok(Json(
            Session::get_by_user_id(&state.database, active_user.session.user_id)
                .await
                .unwrap(),
        ))
    }

    #[oai(path = "/sessions/:session_id", method = "delete")]
    async fn delete_session(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        session_id: Path<String>,
    ) -> poem_openapi::payload::Json<Vec<Session>> {
        match auth {
            AuthToken::Active(active_user) => {
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
