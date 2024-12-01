use std::sync::Arc;

use poem::web::{Data, Query};
use poem_openapi::{payload::Json, Object, OpenApi};
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
    async fn get_item(&self, auth: AuthToken, state: Data<&Arc<AppState>>) -> Json<Vec<Item>> {
        match auth {
            AuthToken::Active(active_user) => Json(
                Item::get_by_owner_id(active_user.session.user_id, &state.database)
                    .await
                    .unwrap(),
            ),
            AuthToken::None => Json(vec![]),
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
