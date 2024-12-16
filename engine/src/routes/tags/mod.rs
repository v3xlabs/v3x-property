use std::sync::Arc;

use poem::web::Data;
use poem::Result;
use poem_openapi::param::Path;
use poem_openapi::payload::Json;
use poem_openapi::OpenApi;

use super::error::HttpError;
use super::ApiTags;
use crate::models::tags::Tag;
use crate::state::AppState;

pub struct TagsApi;

#[OpenApi]
impl TagsApi {
    /// /tags
    ///
    /// Get all tags
    #[oai(path = "/tags", method = "get", tag = "ApiTags::Tags")]
    async fn get_all_tags(&self, state: Data<&Arc<AppState>>) -> Result<Json<Vec<Tag>>> {
        Tag::get_all(&state.database)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    /// /tags
    ///
    /// Create a new tag
    /// Multiple tags with the same name can exist
    #[oai(path = "/tags", method = "post", tag = "ApiTags::Tags")]
    async fn create_tag(&self, state: Data<&Arc<AppState>>, tag: Json<Tag>) -> Result<Json<Tag>> {
        Tag::new(&state.database, &tag.name)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    /// /tags/{tag_id}
    ///
    /// Delete a tag
    #[oai(path = "/tags/{tag_id}", method = "delete", tag = "ApiTags::Tags")]
    async fn delete_tag(
        &self,
        state: Data<&Arc<AppState>>,
        tag_id: Path<i32>,
    ) -> Result<Json<Tag>> {
        Tag::delete(&state.database, tag_id.0)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }
}
