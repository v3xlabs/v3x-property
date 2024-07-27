use std::sync::Arc;

use poem::{get, handler, listener::TcpListener, post, web::Path, EndpointExt, Route, Server};
use poem_openapi::{param::Query, payload::PlainText, OpenApi, OpenApiService};

use crate::state::AppState;

pub mod auth;

struct Api;

#[OpenApi]
impl Api {
    #[oai(path = "/hello", method = "get")]
    async fn index(&self, name: Query<Option<String>>) -> PlainText<String> {
        match name.0 {
            Some(name) => PlainText(format!("Hello, {}!", name)),
            None => PlainText("Hello, World!".to_string()),
        }
    }
}

pub async fn serve(state: AppState) -> Result<(), poem::Error> {
    let api_service =
        OpenApiService::new(Api, "Hello World", "1.0").server("http://localhost:3000/api");

    let ui = api_service.swagger_ui();

    let state = Arc::new(state);

    let app = Route::new().nest("/api", api_service).nest("/", ui).data(state);
    // .at("/", get(root))
    //     .route("/login", get(auth::login))
    //     // OAuth Callback route
    //     .route("/callback", get(auth::callback))
    //     // .route("/devices", get(routes::devices::get))
    //     .with_state(Arc::new(state));

    let listener = TcpListener::bind("0.0.0.0:3000");

    Server::new(listener).run(app).await.unwrap();

    Ok(())
}

#[handler]
async fn root() -> &'static str {
    "Hello, World!"
}
