use std::{collections::HashSet, sync::Arc};

use openid::{Options, Prompt};
use poem::{web::{Data, Redirect}, IntoResponse, Result};
use poem_openapi::{param::Query, payload::PlainText, ApiResponse, OpenApi};

use crate::state::AppState;

use super::super::ApiTags;

pub struct LoginApi;

#[derive(ApiResponse)]
enum RedirectResponse {
    #[oai(status = 302)]
    Redirect(PlainText<String>),
}

#[OpenApi]
impl LoginApi {
    #[oai(path = "/login", method = "get", tag = "ApiTags::Auth")]
    pub async fn login(
        &self,
        redirect: Query<Option<String>>,
        state: Data<&Arc<AppState>>,
    ) -> Result<()> {
        // let discovery_url = "http://localhost:8080/realms/master/.well-known/openid-configuration";

        // let http_client = reqwest::Client::new();
        // let discovery_response: DiscoveryResponse = http_client
        //     .get(discovery_url)
        //     .send()
        //     .await.unwrap()
        //     .json()
        //     .await.unwrap();

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

        // redirect to the authorization URL
        Err(poem::Error::from_response(
            Redirect::temporary(authorize_url.as_str().to_string()).into_response(),
        ))
    }
}
