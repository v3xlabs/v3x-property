use std::sync::Arc;

use poem_openapi::Object;
use serde::{Deserialize, Serialize};

use crate::{modules::intelligence::IntelligenceStatus, state::AppState};

#[derive(Serialize, Deserialize, Object)]
pub struct InstanceModuleStorageStatus {
    pub endpoint_url: String,
    pub bucket: String,
}

#[derive(Serialize, Deserialize, Object)]
pub struct InstanceModulesStatus {
    pub search: bool,
    pub intelligence: Option<IntelligenceStatus>,
    pub storage: InstanceModuleStorageStatus,
}

impl InstanceModulesStatus {
    pub async fn load(state: &Arc<AppState>) -> Self {
        // TODO: introduce more information about connection & status

        let intelligence = match &state.intelligence {
            Some(intelligence) => Some(intelligence.status().await.unwrap()),
            None => None,
        };

        Self {
            search: state.search.is_some(),
            intelligence,
            storage: InstanceModuleStorageStatus {
                endpoint_url: state.storage.endpoint_url.clone(),
                bucket: state.storage.bucket_name.clone(),
            },
        }
    }
}
