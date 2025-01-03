use poem::{web::Data, Error, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use reqwest::StatusCode;

use super::{error::HttpError, ApiTags};
use crate::{
    auth::{middleware::AuthUser, permissions::Action},
    models::{
        location::{ItemLocation, Location},
        user::{user::User, userentry::UserEntry},
    },
    state::AppState,
};

pub mod keys;

pub struct UserApi;

#[OpenApi]
impl UserApi {
    /// /user
    ///
    /// List all users
    #[oai(path = "/user", method = "get", tag = "ApiTags::User")]
    pub async fn users(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
    ) -> Result<Json<Vec<User>>> {
        user.check_policy("user", "", Action::Read).await?;

        Ok(Json(
            UserEntry::find_all(&state.database)
                .await
                .map_err(HttpError::from)?
                .into_iter()
                .map(|user| user.into())
                .collect::<Vec<User>>(),
        ))
    }

    /// /user/:user_id
    ///
    /// Get a User by `user_id`
    #[oai(path = "/user/:user_id", method = "get", tag = "ApiTags::User")]
    pub async fn user(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        user_id: Path<i32>,
    ) -> Result<Json<User>> {
        let target_user_id = user_id.0.to_string();
        user.check_policy("user", Some(target_user_id.as_str()), Action::Read).await?;

        UserEntry::find_by_user_id(user_id.0, &state.database)
            .await
            .map_err(HttpError::from)?
            .ok_or(Error::from_status(StatusCode::NOT_FOUND))
            .map(|user| Json(user.into()))
            .map_err(poem::Error::from)
    }

    /// /user/:user_id/items
    ///
    /// Get all items in a user's location
    #[oai(path = "/user/:user_id/items", method = "get", tag = "ApiTags::User")]
    pub async fn user_items(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        user_id: Path<i32>,
    ) -> Result<Json<Vec<ItemLocation>>> {
        user.check_policy("user", "", Action::Read).await?;

        Location::get_items_by_user_id(&state.database, user_id.0)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }
}
