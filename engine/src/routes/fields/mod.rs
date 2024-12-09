use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{payload::Json, OpenApi};

use super::ApiTags;
use crate::{
    auth::{middleware::AuthUser, permissions::Action},
    models::{field::definition::FieldDefinition, log::LogEntry},
    state::AppState,
};

pub struct FieldsApi;

#[OpenApi]
impl FieldsApi {
    /// /fields/definitions
    ///
    /// Get all field definitions
    #[oai(path = "/fields/definitions", method = "get", tag = "ApiTags::Fields")]
    async fn get_all_field_definitions(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<FieldDefinition>>> {
        user.check_policy("field", None, Action::Read).await?;

        Ok(Json(FieldDefinition::get_all(&state.database).await.unwrap()))
    }
}
