use std::sync::Arc;

use poem::{
    web::{Data, Path}, Result}
;
use poem_openapi::{param::Query, payload::{Json, PlainText}, OpenApi};

use crate::{
    models::{item::Item, media::Media, products::Product},
    state::AppState,
};

use super::error::HttpError;

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

    #[oai(path = "/items", method = "get")]
    async fn get_items(
        &self,
        state: Data<&Arc<AppState>>,
        owner_id: Query<Option<i32>>,
    ) -> poem_openapi::payload::Json<Vec<Item>> {
        let owner_id = owner_id.0.unwrap_or(0);

        let items = Item::get_by_owner_id(owner_id, &state.database)
            .await
            .unwrap();

        poem_openapi::payload::Json(items)
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

        poem_openapi::payload::Json(product.unwrap())
    }

    #[oai(path = "/item/:item_id", method = "get")]
    async fn get_item(
        &self,
        state: Data<&Arc<AppState>>,
        item_id: Path<String>,
    ) -> Result<Json<Item>> {
        let item = Item::get_by_id(item_id.0, &state.database)
            .await
            .unwrap();

        match item {
            Some(item) => Ok(Json(item)),
            None => Err(HttpError::NotFound.into()),
        }
    }
}
