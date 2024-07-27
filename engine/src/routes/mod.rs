use std::sync::Arc;

use poem::{
    get, handler, listener::TcpListener, middleware::CookieJarManager, web::Html, EndpointExt,
    Route, Server,
};
use poem_openapi::{param::Query, payload::PlainText, OpenApi, OpenApiService};

use crate::state::AppState;

pub mod auth;

struct Api;

#[OpenApi]
impl Api {
    /// Testing one two three
    #[oai(path = "/hello", method = "get")]
    async fn index(&self, name: Query<Option<String>>) -> PlainText<String> {
        match name.0 {
            Some(name) => PlainText(format!("Hello, {}!", name)),
            None => PlainText("Hello, World!".to_string()),
        }
    }
}

// returns the html from the index.html file
#[handler]
async fn ui() -> Html<&'static str> {
    Html(include_str!("./index.html"))
}

pub async fn serve(state: AppState) -> Result<(), poem::Error> {
    let api_service =
        OpenApiService::new(Api, "Hello World", "1.0").server("http://localhost:3000/api");

    let spec = api_service.spec_endpoint();

    let state = Arc::new(state);

    let app = Route::new()
        .at("/login", get(auth::login))
        .at("/me", get(auth::me))
        .at("/sessions", get(auth::get_sessions))
        .at("/callback", get(auth::callback))
        .nest("/api", api_service)
        .nest("/openapi.json", spec)
        .at("/", get(ui))
        .with(CookieJarManager::new())
        .data(state);

    let listener = TcpListener::bind("0.0.0.0:3000");

    Server::new(listener).run(app).await.unwrap();

    Ok(())
}

#[handler]
async fn root() -> &'static str {
    "Hello, World!"
}
