use std::sync::Arc;

use poem_openapi::Object;
use serde::{Deserialize, Serialize};

use crate::state::AppState;

#[derive(Serialize, Deserialize, Object)]
pub struct InstanceModulesStatus {
    pub search: bool,
    pub intelligence: bool,
}

impl InstanceModulesStatus {
    pub async fn load(state: &Arc<AppState>) -> Self {

        // TODO: introduce more information about connection & status
        Self {
            search: state.search.is_some(),
            intelligence: state.intelligence.is_some(),
        }
    }
}
