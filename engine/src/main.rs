use tracing::info;

mod router;
mod state;
mod permissions;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    info!("Starting v3x-property");

    let state = state::AppState::default();

    router::serve(state).await.unwrap();
}
