use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{param::Query, payload::Json, OpenApi};

use super::ApiTags;
use crate::{
    auth::{middleware::AuthToken, permissions::Permission},
    models::user::user::User,
    state::AppState,
};
pub struct PolicyApi;

#[OpenApi]
impl PolicyApi {
    /// /policy/enumerate
    ///
    /// Enumerate the permissions for a user
    #[oai(path = "/policy/enumerate", method = "get", tag = "ApiTags::User")]
    pub async fn enumerate(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthToken,
        /// Example: "item" | "product" | "media" | "user"
        resource_type: Query<String>,
        /// Example: "1234" | "AB123"
        resource_id: Query<String>,
    ) -> Result<Json<Vec<Permission>>> {
        Ok(Json(
            User::enumerate_permissions(
                &state.database,
                user,
                &resource_type.0,
                &Some(resource_id.0.to_string().as_str()),
            )
            .await,
        ))
    }
}
