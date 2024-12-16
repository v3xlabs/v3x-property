use std::sync::Arc;

use poem::{web::Data, Error, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use reqwest::StatusCode;

use super::{error::HttpError, ApiTags};
use crate::{
    auth::middleware::AuthUser,
    models::user::{user::User, userentry::UserEntry},
    state::AppState,
};

pub mod keys;

pub struct UserApi;

#[OpenApi]
impl UserApi {
    /// /user/:user_id
    ///
    /// Get a User by `user_id`
    #[oai(path = "/user/:user_id", method = "get", tag = "ApiTags::User")]
    pub async fn user(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        user_id: Path<i32>,
    ) -> Result<Json<User>> {
        let user = user
            .user_id()
            .ok_or(Error::from_status(StatusCode::UNAUTHORIZED))?;

        // TODO: Fix to check policy user:read
        if user != user_id.0 {
            return Err(Error::from_status(StatusCode::FORBIDDEN));
        }

        UserEntry::find_by_user_id(user_id.0, &state.database)
            .await
            .map_err(HttpError::from)?
            .ok_or(Error::from_status(StatusCode::NOT_FOUND))
            .map(|user| Json(user.into()))
            .map_err(poem::Error::from)
    }
}
