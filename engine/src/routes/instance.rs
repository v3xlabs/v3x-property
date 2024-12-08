use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{payload::Json, OpenApi};

use super::ApiTags;
use crate::{
    auth::middleware::AuthToken,
    models::settings::{InstanceSettings, InstanceSettingsConfigurable},
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
        token: AuthToken,
    ) -> Json<InstanceSettings> {
        // match token {
        // AuthToken::Active(active_user) => {
        // TODO: check if user has permission to access this resource

        Json(InstanceSettings::load(&state).await)
        // }
        // _ => {
        // Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
        // panic!()
        // }
        // }
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
        InstanceSettings::update_instance_settings(&state.database, &settings).await;
        Ok(())
    }
}
