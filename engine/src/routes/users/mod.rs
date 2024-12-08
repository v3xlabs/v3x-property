use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use reqwest::StatusCode;

use super::ApiTags;
use crate::{
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
        state: Data<&Arc<AppState>>,
        user_id: Path<i32>,
    ) -> Result<Json<User>> {
        let user = UserEntry::find_by_user_id(user_id.0, &state.database)
            .await
            .unwrap();

        Ok(Json(
            user.ok_or(poem::Error::from_status(StatusCode::NOT_FOUND))?
                .into(),
        ))
    }
}
