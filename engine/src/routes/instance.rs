use std::sync::Arc;

use poem::web::Data;
use poem_openapi::{payload::Json, Enum, Object, OpenApi};
use serde::{Deserialize, Serialize};

use crate::{auth::middleware::AuthToken, state::AppState};

pub struct ApiInstance;

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
}

impl Default for InstanceSettings {
    fn default() -> Self {
        Self {
            id_casing_preference: IdCasingPreference::Upper,
        }
    }
}

#[OpenApi]
impl ApiInstance {
    #[oai(path = "/instance/settings", method = "get")]
    pub async fn settings(
        &self,
        state: Data<&Arc<AppState>>,
        token: AuthToken,
    ) -> Json<InstanceSettings> {
        // match token {
        // AuthToken::Active(active_user) => {
        // TODO: check if user has permission to access this resource

        Json(InstanceSettings::default())
        // }
        // _ => {
        // Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
        // panic!()
        // }
        // }
    }
}
