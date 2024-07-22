use terminal_banner::Banner;
use tracing::info;

mod permissions;
mod router;
mod state;

#[tokio::main]
async fn main() {
    let banner = Banner::new()
    .width(70)
    .text(format!(" V3X Property Engine v{}", env!("CARGO_PKG_VERSION") ).into())
    .text(" Inventory Tracking System.".into())
    .render();
    println!("{}", banner);

    tracing_subscriber::fmt::init();

    info!("Starting v3x-property");

    let state = state::AppState::default();

    router::serve(state).await.unwrap();
}
