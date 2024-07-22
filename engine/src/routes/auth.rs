use std::{borrow::BorrowMut, ops::Deref, sync::Arc};

use axum::{
    extract::{Query, State},
    response::{IntoResponse, Redirect},
};
use openid::{Options, Token};
use serde::Deserialize;
use tracing::info;

use crate::state::AppState;

pub async fn login(state: State<Arc<AppState>>) -> impl IntoResponse {
    // let discovery_url = "http://localhost:8080/realms/master/.well-known/openid-configuration";

    // let http_client = reqwest::Client::new();
    // let discovery_response: DiscoveryResponse = http_client
    //     .get(discovery_url)
    //     .send()
    //     .await.unwrap()
    //     .json()
    //     .await.unwrap();

    let options = Options {
        scope: Some("openid email profile".to_string()),
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

pub async fn callback(query: Query<MyQuery>, state: State<Arc<AppState>>) -> impl IntoResponse {
    let mut token = state.openid.request_token(&query.code).await.unwrap();

    // let mut id_token = (&token.id_token).clone().unwrap().clone();

    let mut token = Token::from(token);

    let mut id_token = token.id_token.take().unwrap();

    state.openid.decode_token(&mut id_token).unwrap();
    state.openid.validate_token(&id_token, None, None).unwrap();

    // info!("Token: {:?}", id_token);

    let x = state.openid.request_userinfo(&token).await.unwrap();

    format!("Hello {:?}", x)
}
