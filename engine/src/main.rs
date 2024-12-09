use terminal_banner::Banner;
use tracing::info;

mod auth;
mod database;
mod ingress;
mod models;
mod modules;
mod routes;
mod state;

#[async_std::main]
async fn main() {
    let banner = Banner::new()
        .width(70)
        .text(format!(" V3X Property Engine v{}", env!("CARGO_PKG_VERSION")).into())
        .text(" Inventory Tracking System.".into())
        .render();
    println!("{}", banner);

    dotenvy::dotenv().ok();

    tracing_subscriber::fmt::init();

    info!("Starting v3x-property");

    let state = state::AppState::from_env().await;

    routes::serve(state).await.unwrap();
}
