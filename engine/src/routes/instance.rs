use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{payload::Json, OpenApi};

use super::ApiTags;
use crate::{
    auth::{
        middleware::AuthToken,
        permissions::Action,
    },
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
        user: AuthToken,
    ) -> Result<Json<InstanceSettings>> {
        user.check_policy("instance", "settings", Action::Read)
            .await?;

        Ok(Json(InstanceSettings::load(&state).await))
    }

    /// /instance/settings
    ///
    /// Update the instance settings
    #[oai(path = "/instance/settings", method = "put", tag = "ApiTags::Instance")]
    pub async fn update_settings(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthToken,
        settings: Json<InstanceSettingsConfigurable>,
    ) -> Result<()> {
        user.check_policy("instance", "settings", Action::Write)
            .await?;

        InstanceSettings::update_instance_settings(&state.database, &settings).await;
        Ok(())
    }
}
