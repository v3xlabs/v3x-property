use std::sync::Arc;

use poem::{
    web::{Data, Multipart},
    Result,
};
use poem_openapi::{
    param::{Path, Query},
    payload::Json,
    Object, OpenApi,
};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

use super::ApiTags;
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
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<Media>>> {
        user.check_policy("media", None, Action::Read).await?;

        Ok(Json(Media::get_all(&state.database).await.unwrap()))
    }

    /// /media/unassigned
    ///
    /// Get all unassigned media
    #[oai(path = "/media/unassigned", method = "get", tag = "ApiTags::Media")]
    async fn get_unassigned_media(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<Media>>> {
        user.check_policy("media", None, Action::Read).await?;

        Ok(Json(Media::get_unassigned(&state.database).await.unwrap()))
    }

    /// /media
    ///
    /// Create a new Media
    #[oai(path = "/media", method = "post", tag = "ApiTags::Media")]
    async fn create_media(
        &self,
        name: Query<String>,
        kind: Query<String>,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        mut upload: Multipart,
    ) -> Result<Json<Media>> {
        user.check_policy("media", None, Action::Write).await?;

        let file = upload.next_field().await.unwrap().unwrap();
        let tempfile = file.bytes().await.unwrap();

        // info!("File: {:?}", tempfile);

        // upload using minio

        let url = state
            .storage
            .upload(&name.0, &kind.0, tempfile.into())
            .await
            .unwrap();

        Ok(Json(
            Media::new(&state.database, name.0, url, kind.0)
                .await
                .unwrap(),
        ))
    }

    /// /media/:media_id
    ///
    /// Get a Media by `media_id`
    #[oai(path = "/media/:media_id", method = "get", tag = "ApiTags::Media")]
    async fn get_media(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        media_id: Path<i32>,
    ) -> Result<Json<Media>> {
        user.check_policy("media", media_id.0.to_string().as_str(), Action::Read)
            .await?;

        Media::get_by_id(&state.database, media_id.0)
            .await
            .or(Err(poem::Error::from_status(
                StatusCode::INTERNAL_SERVER_ERROR,
            )))?
            .ok_or(poem::Error::from_status(StatusCode::NOT_FOUND))
            .map(Json)
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
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        media_id: Path<i32>,
    ) -> Result<Json<Vec<LinkedItem>>> {
        user.check_policy("media", media_id.0.to_string().as_str(), Action::Read)
            .await?;

        Ok(Json(
            Media::get_linked_items(&state.database, media_id.0)
                .await
                .unwrap(),
        ))
    }

    /// /media/:media_id
    ///
    /// Delete a Media by `media_id`
    #[oai(path = "/media/:media_id", method = "delete", tag = "ApiTags::Media")]
    async fn delete_media(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        media_id: Path<i32>,
    ) -> Result<()> {
        user.check_policy("media", media_id.0.to_string().as_str(), Action::Write)
            .await?;

        Media::get_by_id(&state.database, media_id.0)
            .await
            .unwrap()
            .unwrap()
            .delete(&state.database)
            .await
            .unwrap();

        Ok(())
    }
}
