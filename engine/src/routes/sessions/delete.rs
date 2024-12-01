use crate::{auth::middleware::AuthToken, models::sessions::Session, state::AppState};
use poem::{
    handler,
    web::{Data, Json},
    Error, IntoResponse,
};
use reqwest::StatusCode;
use std::sync::Arc;

#[handler]
pub async fn delete_sessions(state: Data<&Arc<AppState>>, token: AuthToken) -> impl IntoResponse {
    match token {
        AuthToken::Active(active_user) => {
            let sessions =
                Session::invalidate_by_user_id(active_user.session.user_id, &state.database)
                    .await
                    .unwrap();

            Json(sessions).into_response()
        }
        _ => Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
    }
}
