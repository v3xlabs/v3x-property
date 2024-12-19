use std::sync::Arc;

use poem::{
    get, handler, listener::TcpListener, middleware::Cors, EndpointExt as _, Route, Server,
};
use poem_openapi::{payload::Html, OpenApi, OpenApiService};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use state::AppState;
use tracing::info;

use crate::routes::MainApi;

#[derive(Debug, Serialize, Deserialize)]
pub struct OperatorHeartbeatPayload {
    pub operator_id: String,
    pub operator_endpoint: String,
}

// pub mod label;
pub mod routes;
pub mod state;
// pub mod template;

fn get_api() -> impl OpenApi {
    MainApi
}

#[async_std::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt::init();

    info!("Starting v3x-property operator");

    let token = std::env::var("PAT_TOKEN").expect("PAT_TOKEN is not set");

    let api_service =
        OpenApiService::new(get_api(), "Hello World", "1.0").server("http://localhost:3001/api");

    let spec = api_service.spec_endpoint();

    let state = AppState {};

    let state = Arc::new(state);

    let app = Route::new()
        .nest("/api", api_service)
        .nest("/openapi.json", spec)
        .at("/docs", get(get_openapi_docs))
        .with(Cors::new())
        .data(state);

    let listener = TcpListener::bind("0.0.0.0:3001");

    let _ = futures::future::join(
        async {
            // send an http request
            let client = Client::new();

            let body = OperatorHeartbeatPayload {
                operator_id: "local-printer".to_string(),
                operator_endpoint: "http://localhost:3001".to_string(),
            };

            let response = client
                .post("http://localhost:3000/api/operators")
                .json(&body)
                .header("Authorization", format!("Bearer {}", token))
                .send()
                .await
                .unwrap();
            info!("Response: {:?}", response);
        },
        Server::new(listener).run(app),
    )
    .await;
}

#[handler]
async fn get_openapi_docs() -> Html<&'static str> {
    Html(include_str!("./index.html"))
}
