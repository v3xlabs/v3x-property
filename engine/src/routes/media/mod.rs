use poem::{
    web::{Data, Multipart},
    Result,
};
use poem_openapi::{
    param::{Path, Query},
    payload::Json,
    Object, OpenApi,
};
use serde::{Deserialize, Serialize};

use super::{error::HttpError, ApiTags};
use crate::{
    auth::{middleware::AuthUser, permissions::Action},
    models::media::{LinkedItem, Media},
    state::AppState,
};

pub struct MediaApi;

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct MediaIdResponse {
    media_id: String,
}

#[OpenApi]
impl MediaApi {
    /// /media
    ///
    /// Get all media
    #[oai(path = "/media", method = "get", tag = "ApiTags::Media")]
    async fn get_all_media(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
    ) -> Result<Json<Vec<Media>>> {
        user.check_policy("media", None, Action::Read).await?;

        Ok(Json(
            Media::get_all(&state.database)
                .await
                .map_err(HttpError::from)?,
        ))
    }

    /// /media/unassigned
    ///
    /// Get all unassigned media
    #[oai(path = "/media/unassigned", method = "get", tag = "ApiTags::Media")]
    async fn get_unassigned_media(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
    ) -> Result<Json<Vec<Media>>> {
        user.check_policy("media", None, Action::Read).await?;

        Ok(Json(Media::get_unassigned(&state.database).await.unwrap()))
    }

    /// /media
    ///
    /// Create a new Media
    /// Media ids are generated by the server
    #[oai(path = "/media", method = "post", tag = "ApiTags::Media")]
    async fn create_media(
        &self,
        name: Query<String>,
        kind: Query<String>,
        user: AuthUser,
        state: Data<&AppState>,
        mut upload: Multipart,
    ) -> Result<Json<Media>> {
        user.check_policy("media", None, Action::Write).await?;

        let file = upload.next_field().await.unwrap().unwrap();
        let tempfile = file.bytes().await.unwrap();

        let url = state
            .storage
            .upload(&name.0, &kind.0, tempfile)
            .await
            .unwrap();

        Media::new(&state.database, name.0, url, kind.0)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    /// /media/:media_id
    ///
    /// Get a Media by `media_id`
    #[oai(path = "/media/:media_id", method = "get", tag = "ApiTags::Media")]
    async fn get_media(
        &self,
        state: Data<&AppState>,
        user: AuthUser,
        media_id: Path<i32>,
    ) -> Result<Json<Media>> {
        user.check_policy("media", media_id.0.to_string().as_str(), Action::Read)
            .await?;

        Media::get_by_id(&state.database, media_id.0)
            .await
            .map_err(HttpError::from)?
            .map(Json)
            .ok_or(HttpError::NotFound.into())
    }

    /// /media/:media_id/items
    ///
    /// Get all items linked to a media by `media_id`
    #[oai(
        path = "/media/:media_id/items",
        method = "get",
        tag = "ApiTags::Media"
    )]
    async fn get_linked_items(
        &self,
        state: Data<&AppState>,
        user: AuthUser,
        media_id: Path<i32>,
    ) -> Result<Json<Vec<LinkedItem>>> {
        user.check_policy("media", media_id.0.to_string().as_str(), Action::Read)
            .await?;

        Media::get_linked_items(&state.database, media_id.0)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    /// /media/:media_id
    ///
    /// Delete a Media by `media_id`
    #[oai(path = "/media/:media_id", method = "delete", tag = "ApiTags::Media")]
    async fn delete_media(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        media_id: Path<i32>,
    ) -> Result<()> {
        user.check_policy("media", media_id.0.to_string().as_str(), Action::Write)
            .await?;

        Media::get_by_id(&state.database, media_id.0)
            .await
            .map_err(HttpError::from)?
            .ok_or(HttpError::NotFound)?
            .delete(&state.database)
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }
}
