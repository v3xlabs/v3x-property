use std::sync::Arc;

use poem::web::{Data};
use poem_openapi::{payload::Json, Enum, Object, OpenApi};
use serde::{Deserialize, Serialize};

use crate::{auth::middleware::AuthToken, models::user_data::{User, UserEntry}, state::AppState};

pub struct ApiInstance;

#[derive(Serialize, Deserialize, Object)]
pub struct InstanceSettings {
    pub id_casing_preference: IdCasingPreference,
}

#[derive(Serialize, Deserialize, Enum)]
pub enum IdCasingPreference {
    #[oai(rename = "upper")]
    #[serde(rename = "upper")]
    Upper,
    #[oai(rename = "lower")]
    #[serde(rename = "lower")]
    Lower,
}

#[OpenApi]
impl ApiInstance {
    #[oai(path = "/instance/settings", method = "get")]
    pub async fn settings(&self, state: Data<&Arc<AppState>>, token: AuthToken) -> Json<InstanceSettings> {
        // match token {
            // AuthToken::Active(active_user) => {
                // TODO: check if user has permission to access this resource

                Json(InstanceSettings {
                    id_casing_preference: IdCasingPreference::Upper,
                })
            // }
            // _ => {
                // Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
                // panic!()
            // }
        // }
    }
}
