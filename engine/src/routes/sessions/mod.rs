use std::sync::Arc;

use poem::web::{Data, Path};
use poem_openapi::{payload::Json, OpenApi};
use tracing::info;

use crate::{
    auth::middleware::AuthToken, models::sessions::Session, state::AppState
};

pub mod delete;

pub struct ApiSessions;

#[OpenApi]
impl ApiSessions {
    #[oai(path = "/sessions", method = "get")]
    async fn get_sessions(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
    ) -> poem_openapi::payload::Json<Vec<Session>> {
        match auth {
            AuthToken::Active(active_user) => poem_openapi::payload::Json(
                Session::get_by_user_id(active_user.session.user_id, &state.database)
                    .await
                    .unwrap(),
            ),
            AuthToken::None => poem_openapi::payload::Json(vec![]),
        }
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
                    &session_id.0,
                    active_user.session.user_id,
                    &state.database,
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
