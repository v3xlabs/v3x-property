use crate::auth::middleware::AuthUser;
use crate::auth::permissions::Action;
use crate::models::local_operators::LocalOperator;
use crate::state::AppState;
use poem::web::Data;
use poem::Result;
use poem_openapi::param::Path;
use poem_openapi::payload::Json;
use poem_openapi::Object;
use poem_openapi::OpenApi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::error::HttpError;
use crate::routes::ApiTags;

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct LocalOperatorPayload {
    // The operator decides this themselves
    pub operator_id: String,
    // This identifies where the operator is running
    pub operator_endpoint: String,
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct OperatorCapabilities {
    pub printers: PrintersInfo,
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct PrintersInfo {
    pub printers: Vec<PrinterInfo>,
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct PrinterInfo {
    pub name: String,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct PrintRequest {
    pub label_template: String,
    pub printer_id: String,
    pub label_id: String,
    pub url: String,
}

pub struct OperatorApi;

#[OpenApi]
impl OperatorApi {
    #[oai(path = "/operators", method = "get", tag = "ApiTags::Operators")]
    async fn list_operators(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
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
        state: Data<&AppState>,
        payload: Json<LocalOperatorPayload>,
    ) -> Result<Json<LocalOperator>> {
        user.check_policy("local_operator", None, Action::Write)
            .await?;

        LocalOperator::upsert(
            &state.database,
            &payload.operator_id,
            &payload.operator_endpoint,
        )
        .await
        .map(Json)
        .map_err(HttpError::from)
        .map_err(poem::Error::from)
    }

    /// /operators/:operator_id/capabilities
    #[oai(
        path = "/operators/:operator_id/capabilities",
        method = "get",
        tag = "ApiTags::Operators"
    )]
    async fn get_operator_capabilities(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        operator_id: Path<String>,
    ) -> Result<Json<OperatorCapabilities>> {
        let operator = LocalOperator::get_operator_by_id(&state.database, &operator_id)
            .await
            .map_err(HttpError::from)?;

        let operator_endpoint = operator.operator_endpoint;

        let client = reqwest::Client::new();

        tracing::info!("Getting capabilities for operator: {}", operator_endpoint);

        let response = client
            .get(format!("{}/api/capabilities", operator_endpoint))
            .send()
            .await
            .unwrap();

        let body = response.json().await.unwrap();

        Ok(Json(body))
    }

    /// /operators/:operator_id/print
    #[oai(
        path = "/operators/:operator_id/print",
        method = "post",
        tag = "ApiTags::Operators"
    )]
    async fn print_file(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        operator_id: Path<String>,
        payload: Json<PrintRequest>,
    ) -> Result<Json<String>> {
        let operator = LocalOperator::get_operator_by_id(&state.database, &operator_id)
            .await
            .map_err(HttpError::from)?;

        let operator_endpoint = operator.operator_endpoint;

        let client = reqwest::Client::new();

        let response = client
            .post(format!("{}/api/print", operator_endpoint))
            .json(&payload.0)
            .send()
            .await
            .unwrap();

        let body = response.text().await.unwrap();

        Ok(Json(body))
    }
}
