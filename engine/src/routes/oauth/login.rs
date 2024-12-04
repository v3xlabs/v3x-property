use std::{collections::HashSet, sync::Arc};

use openid::{Options, Prompt};
use poem::{
    handler,
    web::{Data, Query, Redirect},
    IntoResponse,
};
use serde::Deserialize;

use crate::state::AppState;

#[handler]
pub async fn login(
    redirect: Query<Option<String>>,
    state: Data<&Arc<AppState>>,
) -> impl IntoResponse {
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
    Redirect::temporary(authorize_url.as_str())
}
