use std::sync::Arc;

use poem::web::Data;
use poem_openapi::{payload::Json, OpenApi};

use crate::{
    auth::middleware::AuthToken, models::items::Item, state::AppState
};

pub struct ItemsApi;

#[OpenApi]
impl ItemsApi {
    #[oai(path = "/property/:property_id", method = "get")]
    async fn get_property(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
    ) -> poem_openapi::payload::Json<Vec<Item>> {
        match auth {
            AuthToken::Active(active_user) => poem_openapi::payload::Json(
                Item::get_by_owner_id(active_user.session.user_id, &state.database)
                    .await
                    .unwrap(),
            ),
            AuthToken::None => poem_openapi::payload::Json(vec![]),
        }
    }
}
