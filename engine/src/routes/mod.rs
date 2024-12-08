use std::{env, sync::Arc};

use async_std::path::PathBuf;
use instance::InstanceApi;
use items::ItemsApi;
use logs::LogsApi;
use me::MeApi;
use media::MediaApi;
use oauth::{callback::CallbackApi, login::LoginApi};
use poem::{
    endpoint::StaticFilesEndpoint, get, handler, listener::TcpListener, middleware::Cors,
    web::Html, EndpointExt, Route, Server,
};
use poem_openapi::{OpenApi, OpenApiService, Tags};
use search::{tasks::SearchTaskApi, SearchApi};
use sessions::SessionsApi;
use users::{keys::UserKeysApi, UserApi};

use crate::state::AppState;

pub mod instance;
pub mod items;
pub mod me;
pub mod media;
pub mod oauth;
pub mod search;
pub mod sessions;
pub mod users;
pub mod logs;

#[derive(Tags)]
enum ApiTags {
    /// Items-related operations
    Items,
    /// Media-related operations
    Media,
    /// Logs-related operations
    Logs,
    /// Search-related operations
    Search,
    /// User-related operations
    User,
    /// Auth-related operations
    #[oai(rename = "Authentication")]
    Auth,
    /// Instance-related operations
    Instance,
}

fn get_api() -> impl OpenApi {
    (
        ItemsApi,
        MediaApi,
        SearchApi,
        SearchTaskApi,
        LogsApi,
        MeApi,
        UserApi,
        UserKeysApi,
        SessionsApi,
        InstanceApi,
        LoginApi,
        CallbackApi,
    )
}

#[handler]
async fn get_openapi_docs() -> Html<&'static str> {
    Html(include_str!("./index.html"))
}

pub async fn serve(state: AppState) -> Result<(), poem::Error> {
    let api_service =
        OpenApiService::new(get_api(), "Hello World", "1.0").server("http://localhost:3000/api");

    let spec = api_service.spec_endpoint();

    let static_files = StaticFilesEndpoint::new(
        std::fs::canonicalize(PathBuf::from(
            env::var("WEB_PATH").unwrap_or("./web".to_string()),
        ))
        .unwrap(),
    )
    .fallback_to_index()
    .index_file("index.html");

    let state = Arc::new(state);

    let app = Route::new()
        .nest("/api", api_service)
        .nest("/openapi.json", spec)
        .at("/docs", get(get_openapi_docs))
        .at("/*", static_files)
        .with(Cors::new())
        .data(state);

    let listener = TcpListener::bind("0.0.0.0:3000");

    Server::new(listener).run(app).await.unwrap();

    Ok(())
}
