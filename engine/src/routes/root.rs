use std::sync::Arc;

use poem::
    web::{Data, Path}
;
use poem_openapi::{param::Query, payload::PlainText, OpenApi};

use crate::{
    models::{media::Media, product::Product, property::Property},
    state::AppState,
};

pub struct RootApi;

#[OpenApi]
impl RootApi {
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
    async fn get_media(
        &self,
        state: Data<&Arc<AppState>>,
        media_id: Path<i32>,
    ) -> poem_openapi::payload::Json<Media> {
        let media = Media::get_by_id(media_id.0, &state.database).await.unwrap();

        poem_openapi::payload::Json(media)
    }

    #[oai(path = "/product/:product_id", method = "get")]
    async fn get_product(
        &self,
        state: Data<&Arc<AppState>>,
        product_id: Path<i32>,
    ) -> poem_openapi::payload::Json<Product> {
        let product = Product::get_by_id(product_id.0, &state.database)
            .await
            .unwrap();

        poem_openapi::payload::Json(product)
    }

    #[oai(path = "/property/:property_id", method = "get")]
    async fn get_property(
        &self,
        state: Data<&Arc<AppState>>,
        property_id: Path<i32>,
    ) -> poem_openapi::payload::Json<Property> {
        let property = Property::get_by_id(property_id.0, &state.database)
            .await
            .unwrap();

        poem_openapi::payload::Json(property)
    }
}
