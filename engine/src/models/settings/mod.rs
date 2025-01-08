use std::env;

use build_info::BuildInfo;
use chrono::{DateTime, Utc};
use modules::InstanceModulesStatus;
use poem_openapi::{Enum, Object};
use serde::{Deserialize, Serialize};
use sqlx::{
    prelude::{FromRow, Type},
    query, query_as, query_scalar,
};

use crate::{database::Database, state::AppState};

mod modules;
pub mod statistics;
pub mod version;

build_info::build_info!(fn build_info);

#[derive(
    Serialize, Deserialize, PartialEq, PartialOrd, Enum, Type, Copy, Clone, Debug, Default,
)]
#[sqlx(type_name = "id_casing", rename_all = "lowercase")]
pub enum IdCasingPreference {
    #[oai(rename = "upper")]
    #[serde(rename = "upper")]
    #[default]
    Upper,
    #[oai(rename = "lower")]
    #[serde(rename = "lower")]
    Lower,
}

#[derive(Serialize, Deserialize, Object, FromRow)]
pub struct InstanceSettingsConfigurable {
    pub instance_id: i64,
    pub id_casing_preference: IdCasingPreference,
    pub last_item_id: i64,
}

impl Default for InstanceSettingsConfigurable {
    fn default() -> Self {
        Self {
            instance_id: 1,
            id_casing_preference: IdCasingPreference::default(),
            last_item_id: 1,
        }
    }
}

#[derive(Serialize, Deserialize, Object)]
pub struct BuildDetails {
    pub git_hash: Option<String>,
    pub version: String,
    pub target: String,
    pub timestamp: DateTime<Utc>,
}

impl From<&BuildInfo> for BuildDetails {
    fn from(build_info: &BuildInfo) -> Self {
        let version = &build_info.crate_info.version;
        let target = build_info.target.to_string();
        let timestamp = build_info.timestamp;

        let vc = build_info.version_control.clone();
        let git = vc.and_then(|vc| vc.git().cloned());

        Self {
            git_hash: git.map(|g| g.commit_short_id.clone()),
            version: version.to_string(),
            target,
            timestamp,
        }
    }
}

#[derive(Serialize, Deserialize, Object)]
pub struct InstanceSettings {
    /// Configurable

    /// The casing preference for IDs.
    /// For example, if this is set to `Upper`, then the ID `ab3` will redirect to `AB3`.
    /// This allows for consistent casing across items.
    pub id_casing_preference: IdCasingPreference,
    /// When using numeric item IDs, this last ID is used to generate the next ID.
    pub last_item_id: i64,

    /// Generated
    pub build_info: BuildDetails,

    /// The status of the instance modules.
    pub modules: InstanceModulesStatus,
}

#[derive(Serialize, Deserialize, Object)]
pub struct PublicInstanceSettings {
    /// Whether the landing page is enabled.
    pub landing_mode: bool,
}

impl InstanceSettings {
    pub async fn load(state: &AppState) -> Self {
        let build_info = build_info();

        // TODO: load the instance settings from the database
        let settings = match query_as!(
            InstanceSettingsConfigurable,
            r#"SELECT
                id_casing_preference as "id_casing_preference: IdCasingPreference",
                last_item_id,
                instance_id
            FROM instance_settings WHERE instance_id = 1"#
        )
        .fetch_one(&state.database.pool)
        .await
        .ok()
        {
            Some(settings) => settings,
            None => {
                let settings = InstanceSettingsConfigurable::default();
                InstanceSettings::update_instance_settings(&state.database, &settings).await;
                settings
            }
        };

        Self {
            id_casing_preference: settings.id_casing_preference,
            last_item_id: settings.last_item_id,
            modules: InstanceModulesStatus::load(state).await,
            build_info: build_info.into(),
        }
    }

    pub async fn update_instance_settings(db: &Database, settings: &InstanceSettingsConfigurable) {
        query(
            r#"
            INSERT INTO instance_settings (
                instance_id, 
                id_casing_preference, 
                last_item_id
            ) VALUES (1, $1, $2) 
            ON CONFLICT (instance_id) DO UPDATE SET
                id_casing_preference = $1,
                last_item_id = $2
            "#,
        )
        .bind(settings.id_casing_preference)
        .bind(settings.last_item_id)
        .execute(&db.pool)
        .await
        .unwrap();
    }

    pub async fn get_last_item_id(db: &Database) -> Result<i64, sqlx::Error> {
        Ok(query_scalar::<_, i64>(
            "SELECT last_item_id FROM instance_settings WHERE instance_id = 1",
        )
        .fetch_optional(&db.pool)
        .await?
        .unwrap_or(1))
    }

    pub async fn update_last_item_id(db: &Database, item_id: i64) {
        query("UPDATE instance_settings SET last_item_id = $1 WHERE instance_id = 1")
            .bind(item_id)
            .execute(&db.pool)
            .await
            .unwrap();
    }
}

impl PublicInstanceSettings {
    pub fn get_public_settings() -> Self {
        let landing_mode = env::var("LANDING_MODE")
            .unwrap_or("false".to_owned())
            .parse::<bool>()
            .unwrap();

        Self { landing_mode }
    }
}
