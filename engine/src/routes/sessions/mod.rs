use std::sync::Arc;

use poem::web::Data;
use poem_openapi::OpenApi;

use crate::{
    auth::{middleware::AuthToken, session::SessionState},
    state::AppState,
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
    ) -> poem_openapi::payload::Json<Vec<SessionState>> {
        match auth {
            AuthToken::Active(active_user) => poem_openapi::payload::Json(
                SessionState::get_by_user_id(active_user.session.user_id, &state.database)
                    .await
                    .unwrap(),
            ),
            AuthToken::None => poem_openapi::payload::Json(vec![]),
        }
    }
}
