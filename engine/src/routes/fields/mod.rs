use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, Object, OpenApi};
use serde::{Deserialize, Serialize};

use super::{error::HttpError, ApiTags};
use crate::{
    auth::{middleware::AuthUser, permissions::Action},
    models::field::{definition::FieldDefinition, kind::FieldKind},
    state::AppState,
};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct CreateFieldDefinitionPayload {
    name: String,
    kind: FieldKind,
    description: Option<String>,
    placeholder: Option<String>,
}

pub struct FieldsApi;

#[OpenApi]
impl FieldsApi {
    /// /field/definitions
    ///
    /// Get all field definitions
    #[oai(path = "/field/definitions", method = "get", tag = "ApiTags::Fields")]
    async fn get_all_field_definitions(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<FieldDefinition>>> {
        user.check_policy("field", None, Action::Read).await?;

        FieldDefinition::get_all(&state.database)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// /field/definitions
    ///
    /// Create a new field definition
    #[oai(path = "/field/definitions", method = "post", tag = "ApiTags::Fields")]
    async fn create_field_definition(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        payload: Json<FieldDefinition>,
    ) -> Result<Json<FieldDefinition>> {
        user.check_policy("field", None, Action::Write).await?;

        FieldDefinition::get_by_definition_id(&state.database, &payload.definition_id)
            .await
            .map_err(HttpError::from)?
            .ok_or(HttpError::AlreadyExists)?;

        FieldDefinition::new(
            &state.database,
            &payload.definition_id,
            &payload.name,
            &payload.kind,
            payload.description.as_deref(),
            payload.placeholder.as_deref(),
            payload.icon.as_deref(),
        )
        .await
        .map_err(HttpError::from)
        .map(Json)
        .map_err(poem::Error::from)
    }

    /// /fields/definitions/:id
    ///
    /// Update a field definition
    #[oai(
        path = "/field/definitions/:definition_id",
        method = "patch",
        tag = "ApiTags::Fields"
    )]
    async fn update_field_definition(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        definition_id: Path<String>,
        payload: Json<FieldDefinition>,
    ) -> Result<Json<FieldDefinition>> {
        user.check_policy("field", None, Action::Write).await?;

        // Ensure field exists
        FieldDefinition::get_by_definition_id(&state.database, &definition_id)
            .await
            .map_err(HttpError::from)?
            .ok_or(HttpError::NotFound)?;

        FieldDefinition::update(
            &state.database,
            &definition_id,
            &payload.name,
            &payload.kind,
            payload.description.as_deref(),
            payload.placeholder.as_deref(),
            payload.icon.as_deref(),
        )
        .await
        .map_err(HttpError::from)
        .map(Json)
        .map_err(poem::Error::from)
    }
}
