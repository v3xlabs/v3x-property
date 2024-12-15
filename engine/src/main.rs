
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
    // let app_state = Arc::new(state);

    // IngressProductTask {
    //     // query: "Chromecast G454V".to_string(),
    //     // query: "027242919426".to_string(), // sony xm4
    //     // query: "iPhone 14 Pro Max 256gb zwart".to_string(),
    //     // query: "iPhone 14 Pro Max 256gb zwart".to_string(),
    //     // query: "Kingston DataTraveler Exodia 64GB".to_string(),
    //     // query: "6975337037996".to_string(),
    //     // query: "070847012474".to_string(),
    //     // query: "4945247421354".to_string(), // Muji Eraser
    //     // query: "8717677334667".to_string(), // Tony
    //     // query: "0045496452629".to_string(),
    //     // query: "0194644098728".to_string(), // Anker Powerbank
    //     // query: "070847012474 Monster Energy, Zero Ultra- 16".to_string(),
    //     // query: "0194644098728".to_string(),
    //     // query: "1855004 anker".to_string(),
    //     query: "Apple Watch Series 10".to_string(),
    // }
    // .run(&app_state)
    // .await
    // .unwrap();

    routes::serve(state).await.unwrap();
}
