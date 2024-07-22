
use axum::{routing::get, Router};
use std::sync::Arc;
use tokio::net::TcpListener;

use crate::state::AppState;

pub mod auth;

pub async fn serve(state: AppState) -> Result<(), axum::Error> {
    let app = Router::new()
        .route("/", get(root))
        .route("/login", get(auth::login))
        // .route("/devices", get(routes::devices::get))
        .with_state(Arc::new(state));

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();

    axum::serve(listener, app).await.unwrap();

    Ok(())
}

async fn root() -> &'static str {
    "Hello, World!"
}
