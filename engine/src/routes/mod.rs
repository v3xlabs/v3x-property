use std::sync::Arc;

use poem::{
    get, handler,
    listener::TcpListener,
    middleware::{CookieJarManager, Cors},
    web::{Data, Html, Path},
    EndpointExt, Route, Server,
};
use poem_openapi::{param::Query, payload::PlainText, OpenApi, OpenApiService};

use crate::{models::{media::Media, product::Product, property::Property}, state::AppState};

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

    #[oai(path = "/properties", method = "get")]
    async fn get_properties(
        &self,
        state: Data<&Arc<AppState>>,
        owner_id: Query<Option<i32>>,
    ) -> poem_openapi::payload::Json<Vec<Property>> {
        let owner_id = owner_id.0.unwrap_or(0);

        let properties = Property::get_by_owner_id(owner_id, &state.database)
            .await
            .unwrap();

        poem_openapi::payload::Json(properties)
    }

    #[oai(path = "/media/:media_id", method = "get")]
    async fn get_media(&self, state: Data<&Arc<AppState>>, media_id: Path<i32>) -> poem_openapi::payload::Json<Media> {
        let media = Media::get_by_id(media_id.0, &state.database)
            .await
            .unwrap();

        poem_openapi::payload::Json(media)
    }

    #[oai(path = "/product/:product_id", method = "get")]
    async fn get_product(&self, state: Data<&Arc<AppState>>, product_id: Path<i32>) -> poem_openapi::payload::Json<Product> {
        let product = Product::get_by_id(product_id.0, &state.database)
            .await
            .unwrap();

        poem_openapi::payload::Json(product)
    }

    #[oai(path = "/property/:property_id", method = "get")]
    async fn get_property(&self, state: Data<&Arc<AppState>>, property_id: Path<i32>) -> poem_openapi::payload::Json<Property> {
        let property = Property::get_by_id(property_id.0, &state.database)
            .await
            .unwrap();

        poem_openapi::payload::Json(property)
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
        .at(
            "/sessions",
            get(auth::get_sessions).delete(auth::delete_sessions),
        )
        .at("/callback", get(auth::callback))
        .nest("/api", api_service)
        .nest("/openapi.json", spec)
        .at("/", get(ui))
        .with(CookieJarManager::new())
        .with(Cors::new())
        .data(state);

    let listener = TcpListener::bind("0.0.0.0:3000");

    Server::new(listener).run(app).await.unwrap();

    Ok(())
}

#[handler]
async fn root() -> &'static str {
    "Hello, World!"
}
