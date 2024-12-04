use std::sync::Arc;

use poem::web::Data;
use poem_openapi::{payload::Json, OpenApi};

use crate::{
    auth::middleware::AuthToken,
    models::user::{user::User, userentry::UserEntry},
    state::AppState,
};

pub struct MeApi;

#[OpenApi]
impl MeApi {
    /// /me
    /// 
    /// Get the current user
    #[oai(path = "/me", method = "get")]
    pub async fn me(&self, state: Data<&Arc<AppState>>, token: AuthToken) -> Json<User> {
        match token {
            AuthToken::Active(active_user) => {
                let user = UserEntry::find_by_user_id(active_user.session.user_id, &state.database)
                    .await
                    .unwrap();

                Json(user.unwrap().into())
            }
            _ => {
                // Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
                panic!()
            }
        }
    }
}
