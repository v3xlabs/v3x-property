use std::collections::HashSet;

use openid::{Options, Prompt};
use poem::{web::Data, Result};
use poem_openapi::{param::Query, payload::PlainText, ApiResponse, OpenApi};

use super::super::ApiTags;
use crate::state::AppState;

pub struct LoginApi;

#[derive(ApiResponse)]
pub enum RedirectResponse {
    /// Redirect to the OpenID Connect authorization URL
    #[oai(status = 302)]
    Redirect(#[oai(header = "Location")] String),
    /// Bad request
    #[oai(status = 400)]
    BadRequest(PlainText<String>),
}

#[OpenApi]
impl LoginApi {
    /// /login
    ///
    /// User facing endpoint that redirects to the OpenID Connect authorization URL
    #[oai(path = "/login", method = "get", tag = "ApiTags::Auth")]
    pub async fn login(
        &self,
        redirect: Query<Option<String>>,
        state: Data<&AppState>,
    ) -> Result<RedirectResponse> {
        // scopes, for calendar for example https://www.googleapis.com/auth/calendar.events
        let scope = "openid email profile".to_string();

        let options = Options {
            scope: Some(scope),
            state: redirect.0.clone(),
            prompt: Some(HashSet::from([Prompt::SelectAccount])),
            ..Default::default()
        };

        // Generate the authorization URL
        let authorize_url = state.openid.auth_url(&options);

        println!("OpenID Connect Authorization URL: {}", authorize_url);

        Ok(RedirectResponse::Redirect(
            authorize_url.as_str().to_string(),
        ))
    }
}
