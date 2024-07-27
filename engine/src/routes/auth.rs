use crate::state::AppState;
use openid::{Options, Token};
use poem::{handler, web::{headers::Header, Data, Query, Redirect}, IntoResponse};
use serde::Deserialize;
use std::sync::Arc;

#[handler]
pub async fn login(state: Data<&Arc<AppState>>) -> impl IntoResponse {
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
        ..Default::default()
    };

    // Generate the authorization URL
    let authorize_url = state.openid.auth_url(&options);

    println!("OpenID Connect Authorization URL: {}", authorize_url);

    // redirect to the authorization URL
    Redirect::temporary(authorize_url.as_str())
}

#[derive(Deserialize)]
pub struct MyQuery {
    pub session_state: Option<String>,
    pub iss: Option<String>,
    pub code: String,
    pub prompt: Option<String>,
}

#[handler]
pub async fn callback(query: Query<MyQuery>, state: Data<&Arc<AppState>>) -> impl IntoResponse {
    let mut token = state.openid.request_token(&query.code).await.unwrap();

    let mut token = Token::from(token);

    let mut id_token = token.id_token.take().unwrap();

    state.openid.decode_token(&mut id_token).unwrap();
    state.openid.validate_token(&id_token, None, None).unwrap();

    let oauth_userinfo = state.openid.request_userinfo(&token).await.unwrap();

    format!("Hello {:?}", oauth_userinfo);

    // Now we must verify the user information, decide wether they deserve access, and if so return a token.
    let user = state
        .database
        .upsert_get_user(&oauth_userinfo)
        .await
        .unwrap();

    // TODO: return a token

    let token = "hello".to_string();

    Redirect::temporary("http://localhost:3000/hello").with_header("Set-Cookie", format!("property.v3x.token={}", token))
}
