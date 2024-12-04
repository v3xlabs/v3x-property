use std::sync::Arc;

use modules::InstanceModulesStatus;
use poem_openapi::{Enum, Object};
use serde::{Deserialize, Serialize};

use crate::state::AppState;

mod modules;

#[derive(Serialize, Deserialize, Enum)]
pub enum IdCasingPreference {
    #[oai(rename = "upper")]
    #[serde(rename = "upper")]
    Upper,
    #[oai(rename = "lower")]
    #[serde(rename = "lower")]
    Lower,
}


#[derive(Serialize, Deserialize, Object)]
pub struct InstanceSettings {
    pub id_casing_preference: IdCasingPreference,

    pub modules: InstanceModulesStatus,
}

impl InstanceSettings {
    pub async fn load(state: &Arc<AppState>) -> Self {
        //

        Self {
            id_casing_preference: IdCasingPreference::Upper,
            modules: InstanceModulesStatus::load(state).await,
        }
    }
}