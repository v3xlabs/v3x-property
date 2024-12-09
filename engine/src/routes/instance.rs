use std::sync::Arc;

use poem::{web::Data, Error, Result};
use poem_openapi::{payload::Json, OpenApi};
use reqwest::StatusCode;

use super::ApiTags;
use crate::{
    auth::{middleware::AuthToken, permissions::Permission},
    models::{
        settings::{InstanceSettings, InstanceSettingsConfigurable},
        user::user::User,
    },
    state::AppState,
};
pub struct InstanceApi;

#[OpenApi]
impl InstanceApi {
    /// /instance/settings
    ///
    /// Get the instance settings
    #[oai(path = "/instance/settings", method = "get", tag = "ApiTags::Instance")]
    pub async fn settings(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthToken,
    ) -> Result<Json<InstanceSettings>> {
        User::has_permissions(
            &state.database,
            user,
            "instance",
            Some("settings"),
            &[Permission::Read],
        )
        .await
        .ok_or(Error::from_status(StatusCode::UNAUTHORIZED))?;

        Ok(Json(InstanceSettings::load(&state).await))
    }

    /// /instance/settings
    ///
    /// Update the instance settings
    #[oai(path = "/instance/settings", method = "put", tag = "ApiTags::Instance")]
    pub async fn update_settings(
        &self,
        state: Data<&Arc<AppState>>,
        token: AuthToken,
        settings: Json<InstanceSettingsConfigurable>,
    ) -> Result<()> {
        User::has_permissions(
            &state.database,
            token,
            "instance",
            Some("settings"),
            &[Permission::Write],
        )
        .await
        .ok_or(Error::from_status(StatusCode::UNAUTHORIZED))?;

        InstanceSettings::update_instance_settings(&state.database, &settings).await;
        Ok(())
    }
}
