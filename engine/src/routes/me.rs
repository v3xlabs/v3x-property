use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{payload::Json, ApiResponse, OpenApi};

use super::{error::HttpError, ApiTags};
use crate::{
    auth::middleware::AuthUser,
    models::user::{user::User, userentry::UserEntry},
    state::AppState,
};

pub struct MeApi;

#[OpenApi]
impl MeApi {
    /// /me
    ///
    /// Get the current user
    #[oai(path = "/me", method = "get", tag = "ApiTags::User")]
    pub async fn me(&self, state: Data<&Arc<AppState>>, token: AuthUser) -> Result<Json<User>> {
        let active_user = token.user_id().ok_or(HttpError::Forbidden)?;

        UserEntry::find_by_user_id(active_user, &state.database)
            .await
            .map_err(HttpError::from)?
            .map(|x| Json(User::from(x)))
            .ok_or(HttpError::NotFound)
            .map_err(poem::Error::from)
    }
}
