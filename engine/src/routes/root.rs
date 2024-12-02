use std::sync::Arc;

use poem::{
    web::{Data, Path},
};
use poem_openapi::{
    param::Query,
    payload::{Json, PlainText},
    OpenApi,
};

use crate::{
    models::{item::Item, media::Media, products::Product},
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

    #[oai(path = "/media/:media_id", method = "get")]
    async fn get_media(
        &self,
        state: Data<&Arc<AppState>>,
        media_id: Path<i32>,
    ) -> poem_openapi::payload::Json<Media> {
        let media = Media::get_by_id(&state.database, media_id.0).await.unwrap();

        poem_openapi::payload::Json(media)
    }

    #[oai(path = "/product/:product_id", method = "get")]
    async fn get_product(
        &self,
        state: Data<&Arc<AppState>>,
        product_id: Path<i32>,
    ) -> poem_openapi::payload::Json<Product> {
        let product = Product::get_by_id(&state.database, product_id.0)
            .await
            .unwrap();

        poem_openapi::payload::Json(product.unwrap())
    }

    // #[oai(path = "/item/:item_id", method = "get")]
    // async fn get_item(
    //     &self,
    //     state: Data<&Arc<AppState>>,
    //     item_id: Path<String>,
    // ) -> Result<Json<Item>> {
    //     let item = Item::get_by_id(&state.database, item_id.0).await.unwrap();

    //     match item {
    //         Some(item) => Ok(Json(item)),
    //         None => Err(StatusCode::NOT_FOUND.into()),
    //     }
    // }
}
