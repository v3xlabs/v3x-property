use poem::{web::Data, Result};
use poem_openapi::{payload::Json, OpenApi};

use super::ApiTags;
use crate::{
    auth::{middleware::AuthUser, permissions::Action},
    models::settings::{
        statistics::{InstanceStatistics, StorageStatistics},
        version::VersionSettings,
        InstanceSettings, InstanceSettingsConfigurable,
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
        state: Data<&AppState>,
        user: AuthUser,
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
        state: Data<&AppState>,
        user: AuthUser,
        settings: Json<InstanceSettingsConfigurable>,
    ) -> Result<()> {
        user.check_policy("instance", "settings", Action::Write)
            .await?;

        InstanceSettings::update_instance_settings(&state.database, &settings).await;

        Ok(())
    }

    /// /instance/statistics
    ///
    /// Get the instance statistics
    #[oai(
        path = "/instance/statistics",
        method = "get",
        tag = "ApiTags::Instance"
    )]
    pub async fn statistics(&self, state: Data<&AppState>) -> Result<Json<InstanceStatistics>> {
        Ok(Json(InstanceStatistics::load(&state).await))
    }

    /// /instance/storage
    ///
    /// Get the instance storage statistics
    #[oai(
        path = "/instance/statistics/storage",
        method = "get",
        tag = "ApiTags::Instance"
    )]
    pub async fn storage(&self, state: Data<&AppState>) -> Result<Json<StorageStatistics>> {
        Ok(Json(StorageStatistics::load(&state).await))
    }

    /// /instance/version
    ///
    /// Get the instance version & potentially available updates
    #[oai(path = "/instance/version", method = "get", tag = "ApiTags::Instance")]
    pub async fn version(&self) -> Result<Json<VersionSettings>> {
        Ok(Json(VersionSettings::load().await?))
    }
}
