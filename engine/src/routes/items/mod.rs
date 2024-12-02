use std::sync::Arc;

use poem::{web::{Data, Path, Query}, Result};
use poem_openapi::{payload::Json, Object, OpenApi};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{auth::middleware::AuthToken, models::item::Item, state::AppState};

pub struct ItemsApi;

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct ItemIdResponse {
    item_id: String,
}

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct CreateItemRequest {
    item_id: String,
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
        let item = Item::get_by_id(&state.database, item_id.0).await.unwrap();

        match item {
            Some(item) => Ok(Json(item)),
            None => Err(StatusCode::NOT_FOUND.into()),
        }
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
}
