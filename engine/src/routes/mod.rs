use std::sync::Arc;

use me::ApiMe;
use poem::{
    get, handler, listener::TcpListener, middleware::Cors, web::Html, EndpointExt, Route, Server,
};
use poem_openapi::{OpenApi, OpenApiService};
use root::RootApi;
use sessions::ApiSessions;

use crate::state::AppState;

pub mod me;
pub mod oauth;
pub mod root;
pub mod sessions;

fn get_api() -> impl OpenApi {
    (RootApi, ApiMe, ApiSessions)
}

#[handler]
async fn get_openapi_docs() -> Html<&'static str> {
    Html(include_str!("./index.html"))
}

pub async fn serve(state: AppState) -> Result<(), poem::Error> {
    let api_service =
        OpenApiService::new(get_api(), "Hello World", "1.0").server("http://localhost:3000/api");

    let spec = api_service.spec_endpoint();

    let state = Arc::new(state);

    let app = Route::new()
        .at("/login", get(oauth::login::login))
        .at("/callback", get(oauth::callback::callback))
        .nest("/api", api_service)
        .nest("/openapi.json", spec)
        .at("/docs", get(get_openapi_docs))
        .at("/", get(get_openapi_docs))
        .with(Cors::new())
        .data(state);

    let listener = TcpListener::bind("0.0.0.0:3000");

    Server::new(listener).run(app).await.unwrap();

    Ok(())
}
