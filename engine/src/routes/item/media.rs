use std::sync::Arc;

use poem::web::Data;
use poem::Result;
use poem_openapi::param::Path;
use poem_openapi::payload::Json;
use poem_openapi::OpenApi;

use crate::auth::middleware::AuthUser;
use crate::auth::permissions::Action;
use crate::models::item::media::ItemMedia;
use crate::routes::ApiTags;
use crate::state::AppState;

pub struct ItemMediaApi;

#[OpenApi]
impl ItemMediaApi {
    /// /item/:item_id/media
    ///
    /// Get all media for an Item by `item_id`
    #[oai(path = "/item/:item_id/media", method = "get", tag = "ApiTags::Items")]
    async fn get_item_media(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        item_id: Path<String>,
    ) -> Result<Json<Vec<i32>>> {
        user.check_policy("item", item_id.0.to_string().as_str(), Action::Read)
            .await?;

        let media = ItemMedia::get_by_item_id(&state.database, &item_id.0)
            .await
            .unwrap();

        Ok(Json(media.iter().map(|m| m.media_id).collect()))
    }
}
