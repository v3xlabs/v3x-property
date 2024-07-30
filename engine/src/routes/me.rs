use std::sync::Arc;

use poem::web::Data;
use poem_openapi::{payload::Json, OpenApi};

use crate::{auth::middleware::AuthToken, models::user_data::{User, UserEntry}, state::AppState};

pub struct ApiMe;

#[OpenApi]
impl ApiMe {
    #[oai(path = "/me", method = "get")]
    pub async fn me(&self, state: Data<&Arc<AppState>>, token: AuthToken) -> Json<User> {
        match token {
            AuthToken::Active(active_user) => {
                let user = UserEntry::get_by_id(active_user.session.user_id, &state.database)
                    .await
                    .unwrap();

                Json(user.into())
            }
            _ => {
                // Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
                panic!()
            }
        }
    }
}
