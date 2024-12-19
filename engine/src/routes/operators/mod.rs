use std::sync::Arc;

use crate::auth::middleware::AuthUser;
use crate::auth::permissions::Action;
use crate::models::local_operators::LocalOperator;
use crate::state::AppState;
use poem::web::Data;
use poem::Result;
use poem_openapi::payload::Json;
use poem_openapi::Object;
use poem_openapi::OpenApi;
use serde::{Deserialize, Serialize};

use super::error::HttpError;
use crate::routes::ApiTags;

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct LocalOperatorPayload {
    // The operator decides this themselves
    pub operator_id: String,
    // This identifies where the operator is running
    pub operator_endpoint: String,
}

pub struct OperatorApi;

#[OpenApi]
impl OperatorApi {
    #[oai(path = "/operators", method = "get", tag = "ApiTags::Operators")]
    async fn list_operators(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<LocalOperator>>> {
        user.check_policy("local_operator", None, Action::Read)
            .await?;

        LocalOperator::list_operators(&state.database)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    #[oai(path = "/operators", method = "post", tag = "ApiTags::Operators")]
    async fn create_operator(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        payload: Json<LocalOperatorPayload>,
    ) -> Result<Json<LocalOperator>> {
        user.check_policy("local_operator", None, Action::Write)
            .await?;

        LocalOperator::upsert(&state.database, &payload.operator_id, &payload.operator_endpoint)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }
}
