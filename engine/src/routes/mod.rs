use std::{env, sync::Arc};

use async_std::path::PathBuf;
use fields::FieldsApi;
use instance::InstanceApi;
use item::{intelligence::ItemIntelligenceApi, media::ItemMediaApi, ItemsApi};
use location::LocationApi;
use logs::LogsApi;
use me::MeApi;
use media::MediaApi;
use oauth::{callback::CallbackApi, login::LoginApi};
use operators::OperatorApi;
use poem::{
    endpoint::StaticFilesEndpoint, get, handler, listener::TcpListener, middleware::Cors,
    web::Html, EndpointExt, Route, Server,
};
use poem_openapi::{OpenApi, OpenApiService, Tags};
use policy::PolicyApi;
use product::ProductApi;
use search::{tasks::SearchTaskApi, SearchApi};
use sessions::SessionsApi;
use tags::TagsApi;
use users::{keys::UserKeysApi, UserApi};

use crate::state::AppState;

pub mod error;
pub mod fields;
pub mod instance;
pub mod item;
pub mod location;
pub mod logs;
pub mod me;
pub mod media;
pub mod oauth;
pub mod operators;
pub mod policy;
pub mod product;
pub mod search;
pub mod sessions;
pub mod tags;
pub mod users;

#[derive(Tags)]
enum ApiTags {
    /// Items-related operations
    Items,
    /// Product-related operations
    Product,
    /// Location-related operations
    Location,
    /// Media-related operations
    Media,
    /// Fields-related operations
    Fields,
    /// Tags-related operations
    Tags,
    /// Logs-related operations
    Logs,
    /// Search-related operations
    Search,
    /// Operators-related operations
    Operators,
    /// User-related operations
    User,
    /// Auth-related operations
    #[oai(rename = "Authentication")]
    Auth,
    /// Instance-related operations
    Instance,
}

fn get_api_2() -> impl OpenApi {
    (
        // Items
        (ItemsApi, ItemMediaApi, ItemIntelligenceApi),
        // Product
        ProductApi,
        // Location
        LocationApi,
        // Media
        MediaApi,
        // Search
        (SearchApi, SearchTaskApi),
        // Fields
        FieldsApi,
        // Tags
        TagsApi,
        // Logs
        LogsApi,
    )
}

fn get_api() -> impl OpenApi {
    (
        get_api_2(),
        // Me
        MeApi,
        // Operators
        OperatorApi,
        // User
        (UserApi, UserKeysApi),
        // Policy
        PolicyApi,
        // Sessions
        SessionsApi,
        // Instance
        InstanceApi,
        // Auth
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
