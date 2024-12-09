use std::sync::Arc;

use poem::web::Data;
use poem::Error;
use poem::Result;
use poem_openapi::Object;
use poem_openapi::{param::Path, payload::Json, OpenApi};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

use super::super::ApiTags;
use crate::auth::middleware::AuthToken;
use crate::models::keys::UserApiKey;
use crate::state::AppState;

pub struct UserKeysApi;

#[derive(Deserialize, Object)]
pub struct CreateKeyRequest {
    pub name: String,
    pub permissions: String,
}

#[derive(Serialize, Object)]
pub struct CreateKeyResponse {
    pub key: UserApiKey,
    pub token: String,
}

#[OpenApi]
impl UserKeysApi {
    /// /user/:user_id/keys
    ///
    /// Create a new API key for a user
    #[oai(path = "/user/:user_id/keys", method = "post", tag = "ApiTags::User")]
    pub async fn create_key(
        &self,
        user: AuthToken,
        state: Data<&Arc<AppState>>,
        user_id: Path<i32>,
        body: Json<CreateKeyRequest>,
    ) -> Result<Json<CreateKeyResponse>> {
        let user = user
            .ok()
            .ok_or(Error::from_status(StatusCode::UNAUTHORIZED))?;

        if user.session.user_id != user_id.0 {
            return Err(Error::from_status(StatusCode::FORBIDDEN));
        }

        let (key, token) =
            UserApiKey::new(&state.database, user_id.0, &body.name, &body.permissions)
                .await
                .unwrap();

        Ok(Json(CreateKeyResponse { key, token }))
    }

    /// /user/:user_id/keys
    ///
    /// Get all API keys for a user
    #[oai(path = "/user/:user_id/keys", method = "get", tag = "ApiTags::User")]
    pub async fn get_keys(
        &self,
        user: AuthToken,
        state: Data<&Arc<AppState>>,
        user_id: Path<i32>,
    ) -> Result<Json<Vec<UserApiKey>>> {
        let user = user
            .ok()
            .ok_or(Error::from_status(StatusCode::UNAUTHORIZED))?;

        if user.session.user_id != user_id.0 {
            return Err(Error::from_status(StatusCode::FORBIDDEN));
        }

        Ok(Json(
            UserApiKey::find_by_user_id(user_id.0, &state.database)
                .await
                .unwrap(),
        ))
    }

    /// /user/:user_id/keys/:token_id
    ///
    /// Delete an API key for a user
    #[oai(
        path = "/user/:user_id/keys/:token_id",
        method = "delete",
        tag = "ApiTags::User"
    )]
    pub async fn delete_key(
        &self,
        user: AuthToken,
        state: Data<&Arc<AppState>>,
        user_id: Path<i32>,
        token_id: Path<i32>,
    ) -> Result<()> {
        let user = user
            .ok()
            .ok_or(Error::from_status(StatusCode::UNAUTHORIZED))?;

        if user.session.user_id != user_id.0 {
            return Err(Error::from_status(StatusCode::FORBIDDEN));
        }

        UserApiKey::delete_by_token_id(token_id.0, &state.database)
            .await
            .unwrap();
        // StatusCode::NO_CONTENT
        Ok(())
    }
}
