use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{
    param::{Path, Query},
    payload::Json,
    Object, OpenApi,
};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tracing::info;

use super::ApiTags;
use crate::{
    auth::middleware::AuthToken,
    models::{
        item::{media::ItemMedia, Item},
        log::LogEntry,
    },
    state::AppState,
};

pub struct ItemsApi;

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct ItemIdResponse {
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
    /// /item/owned
    ///
    /// Get all items owned by the current user
    #[oai(path = "/item/owned", method = "get", tag = "ApiTags::Items")]
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

    /// /item
    ///
    /// Create an Item
    #[oai(path = "/item", method = "post", tag = "ApiTags::Items")]
    async fn create_item(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        item_id: Query<String>,
    ) -> Json<Item> {
        Json(
            Item {
                item_id: item_id.0,
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

    /// /item/next
    ///
    /// Suggest next Item Id
    #[oai(path = "/item/next", method = "get", tag = "ApiTags::Items")]
    async fn next_item_id(&self, state: Data<&Arc<AppState>>) -> Json<ItemIdResponse> {
        info!("Getting next item id");

        Json(ItemIdResponse {
            item_id: Item::next_id(&state.database).await.unwrap(),
        })
    }

    /// /item/:item_id
    ///
    /// Delete an Item by `item_id`
    #[oai(path = "/item/:item_id", method = "delete", tag = "ApiTags::Items")]
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

    /// /item/:item_id
    ///
    /// Get an Item by `item_id`
    #[oai(path = "/item/:item_id", method = "get", tag = "ApiTags::Items")]
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

    /// /item/:item_id
    ///
    /// Edit an Item by `item_id`
    /// This updates the `name`, `owner_id`, `location_id`, `product_id`, and `media` (linking `"new-media"`, and removing `"removed-media"`)
    #[oai(path = "/item/:item_id", method = "patch", tag = "ApiTags::Items")]
    async fn edit_item(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        item_id: Path<String>,
        data: Json<ItemUpdatePayload>,
    ) -> Result<()> {
        let _ = Item::edit_by_id(&state.search, &state.database, &data.0, &item_id.0).await;

        let _ = LogEntry::new(
            &state.database,
            "item",
            &item_id.0,
            auth.ok().unwrap().session.user_id,
            "edit",
            &serde_json::to_string(&data.0).unwrap(),
        )
        .await;

        Ok(())
    }

    /// /item/:item_id/media
    ///
    /// Get all media for an Item by `item_id`
    #[oai(path = "/item/:item_id/media", method = "get", tag = "ApiTags::Items")]
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

    /// /item/:item_id/logs
    ///
    /// Get all logs for an Item by `item_id`
    #[oai(path = "/item/:item_id/logs", method = "get", tag = "ApiTags::Items")]
    async fn get_item_logs(
        &self,
        state: Data<&Arc<AppState>>,
        auth: AuthToken,
        item_id: Path<String>,
    ) -> Result<Json<Vec<LogEntry>>> {
        Ok(Json(
            LogEntry::find_by_resource(&state.database, "item", &item_id.0)
                .await
                .unwrap(),
        ))
    }
}
