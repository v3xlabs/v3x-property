use axum::{body::Body, response::{IntoResponse, Redirect, Response}, routing::get, Router};
use openid::{Client, DiscoveredClient, Options};
use reqwest::Url;
use serde::Deserialize;
use std::sync::Arc;
use tokio::net::TcpListener;

use crate::state::AppState;

// mod routes;

pub async fn serve(state: AppState) -> Result<(), axum::Error> {
    let app = Router::new()
        .route("/", get(root))
        .route("/login", get(login))
        // .route("/devices", get(routes::devices::get))
        .with_state(Arc::new(state));

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();

    axum::serve(listener, app).await.unwrap();

    Ok(())
}

async fn root() -> &'static str {
    "Hello, World!"
}

#[derive(Deserialize)]
struct DiscoveryResponse {
    authorization_endpoint: String,
    token_endpoint: String,
    userinfo_endpoint: Option<String>,
    jwks_uri: String,
    issuer: String,
    #[serde(flatten)]
    other: std::collections::HashMap<String, serde_json::Value>,
}

async fn login() -> impl IntoResponse {
    // let discovery_url = "http://localhost:8080/realms/master/.well-known/openid-configuration";

    // let http_client = reqwest::Client::new();
    // let discovery_response: DiscoveryResponse = http_client
    //     .get(discovery_url)
    //     .send()
    //     .await.unwrap()
    //     .json()
    //     .await.unwrap();

    // Create the OpenID client
    let client_id = "devclient";
    let client_secret = Some("wavt7wfi7VXkv5ex9PMFKOGBBnVhfZzy");
    let redirect_url = "http://localhost:3000/callback";

    let client = DiscoveredClient::discover(
        client_id.to_string(),
        client_secret.map(|s| s.to_string()),
        Some(redirect_url.to_string()),
        "http://localhost:8080/realms/master".parse().unwrap()
        // discovery_response.issuer.parse().unwrap()
    )
    .await.unwrap();

    // Generate the authorization URL
    let authorize_url = client.auth_url(&Options::default());

    println!("OpenID Connect Authorization URL: {}", authorize_url);

    // redirect to the authorization URL
    Redirect::temporary(authorize_url.as_str())
}
