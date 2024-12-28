use poem::{web::Data, Result};
use poem_openapi::{param::Query, payload::Json, OpenApi};
use serde::{Deserialize, Serialize};

use super::ApiTags;
use crate::{
    auth::{middleware::AuthUser, permissions::Action},
    models::user::user::User,
    state::AppState,
};
use poem_openapi::Object;

pub struct PolicyApi;

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct BatchRequest {
    resource_type: String,
    resource_id: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct BatchResponse {
    resource_type: String,
    resource_id: Option<String>,
    result: Vec<Action>,
}

#[OpenApi]
impl PolicyApi {
    /// /policy/enumerate
    ///
    /// Enumerate the permissions for a user
    #[oai(path = "/policy/enumerate", method = "get", tag = "ApiTags::User")]
    pub async fn enumerate(
        &self,
        state: Data<&AppState>,
        user: AuthUser,
        /// Example: "item" | "product" | "media" | "user"
        resource_type: Query<String>,
        /// Example: "1234" | "AB123"
        resource_id: Query<Option<String>>,
    ) -> Result<Json<Vec<Action>>> {
        let resource_id = resource_id.as_ref().map(|id| id.as_str());

        Ok(Json(
            User::enumerate_permissions(&state.database, user, &resource_type.0, resource_id).await,
        ))
    }

    /// /policy/batch
    ///
    /// Batch enumerate policy requests
    #[oai(path = "/policy/batch", method = "post", tag = "ApiTags::User")]
    pub async fn batch(
        &self,
        state: Data<&AppState>,
        user: AuthUser,
        payload: Json<Vec<BatchRequest>>,
    ) -> Result<Json<Vec<BatchResponse>>> {
        let mut results = vec![];

        for request in payload.0.iter() {
            let resource_id = request.resource_id.clone();
            let resource_type = request.resource_type.clone();

            let result = User::enumerate_permissions(
                &state.database,
                user.user_id().unwrap(),
                &resource_type,
                resource_id.as_deref(),
            )
            .await;

            results.push(BatchResponse {
                resource_id,
                resource_type,
                result,
            });
        }

        Ok(Json(results))
    }
}
