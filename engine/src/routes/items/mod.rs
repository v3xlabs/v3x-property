use std::sync::Arc;

use poem::{
    web::{Data, Path, Query},
    Result,
};
use poem_openapi::{payload::Json, Object, OpenApi};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{
    auth::middleware::AuthToken,
    models::item::{media::ItemMedia, Item},
    state::AppState,
};

pub struct ItemsApi;

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct ItemIdResponse {
    item_id: String,
}

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct CreateItemRequest {
    item_id: String,
}


#[derive(poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemUpdatePayload {
    pub name: Option<String>,
    pub owner_id: Option<i32>,
    pub location_id: Option<i32>,
    pub product_id: Option<i32>,
    pub media: Option<Vec<ItemUpdateMediaPayload>>,
}

#[derive(poem_openapi::Enum, Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ItemUpdateMediaStatus {
    #[serde(rename = "new-media")]
    #[oai(rename = "new-media")]
    NewMedia,
    #[serde(rename = "removed-media")]
    #[oai(rename = "removed-media")]
    RemovedMedia,
    #[serde(rename = "existing-media")]
    #[oai(rename = "existing-media")]
    ExistingMedia,
}

#[derive(poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemUpdateMediaPayload {
    pub status: ItemUpdateMediaStatus,
    pub media_id: i32,
}

#[OpenApi]
impl ItemsApi {
    #[oai(path = "/item/:item_id", method = "get")]
    async fn get_item(
        &self,
        state: Data<&Arc<AppState>>,
        auth: AuthToken,
        item_id: Path<String>,
    ) -> Result<Json<Item>> {
        let item = Item::get_by_id(&state.database, &item_id.0).await.unwrap();

        match item {
            Some(item) => Ok(Json(item)),
            None => Err(StatusCode::NOT_FOUND.into()),
        }
    }

    #[oai(path = "/item/:item_id", method = "delete")]
    async fn delete_item(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        item_id: Path<String>,
    ) -> Result<()> {
        let item = Item::get_by_id(&state.database, &item_id.0)
            .await
            .unwrap()
            .unwrap();

        item.delete(&state.search, &state.database).await.unwrap();

        Ok(())
    }

    #[oai(path = "/item/:item_id", method = "patch")]
    async fn edit_item(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        item_id: Path<String>,
        data: Json<ItemUpdatePayload>,
    ) -> Result<()> {
        Item::edit_by_id(&state.search, &state.database, data.0, &item_id.0).await;
        Ok(())
    }

    #[oai(path = "/item/owned", method = "get")]
    async fn get_owned_items(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<Item>>> {
        match auth.ok() {
            Some(user) => Ok(Json(
                Item::get_by_owner_id(&state.database, user.session.user_id)
                    .await
                    .unwrap(),
            )),
            None => Err(StatusCode::UNAUTHORIZED.into()),
        }
    }

    #[oai(path = "/item/create", method = "post")]
    async fn create_item(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        request: Query<CreateItemRequest>,
    ) -> Json<Item> {
        Json(
            Item {
                item_id: request.item_id.clone(),
                owner_id: auth.ok().map(|user| user.session.user_id),
                ..Default::default()
            }
            .insert(&state.database)
            .await
            .unwrap()
            .index_search(&state.search, &state.database)
            .await
            .unwrap(),
        )
    }

    #[oai(path = "/item/next", method = "get")]
    async fn next_item_id(&self, state: Data<&Arc<AppState>>) -> Json<ItemIdResponse> {
        info!("Getting next item id");

        Json(ItemIdResponse {
            item_id: Item::next_id(&state.database).await.unwrap(),
        })
    }


    #[oai(path = "/item/:item_id/media", method = "get")]
    async fn get_item_media(
        &self,
        state: Data<&Arc<AppState>>,
        auth: AuthToken,
        item_id: Path<String>,
    ) -> Result<Json<Vec<i32>>> {
        let media = ItemMedia::get_by_item_id(&state.database, &item_id.0)
            .await
            .unwrap();

        Ok(Json(media.iter().map(|m| m.media_id).collect()))
    }
}
