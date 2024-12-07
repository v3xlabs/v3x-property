use std::sync::Arc;

use poem::{
    web::{Data, Multipart},
    Result,
};
use poem_openapi::{param::{Path, Query}, payload::Json, Object, OpenApi};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

use super::ApiTags;
use crate::{
    auth::middleware::AuthToken,
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
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<Media>>> {
        match auth.ok() {
            Some(user) => Ok(Json(Media::get_all(&state.database).await.unwrap())),
            None => Err(StatusCode::UNAUTHORIZED.into()),
        }
    }

    /// /media/unassigned
    ///
    /// Get all unassigned media
    #[oai(path = "/media/unassigned", method = "get", tag = "ApiTags::Media")]
    async fn get_unassigned_media(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<Media>>> {
        match auth.ok() {
            Some(user) => Ok(Json(Media::get_unassigned(&state.database).await.unwrap())),
            None => Err(StatusCode::UNAUTHORIZED.into()),
        }
    }

    /// /media
    ///
    /// Create a new Media
    #[oai(path = "/media", method = "post", tag = "ApiTags::Media")]
    async fn create_media(
        &self,
        name: Query<String>,
        kind: Query<String>,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        mut upload: Multipart,
    ) -> Json<Media> {
        let file = upload.next_field().await.unwrap().unwrap();
        let tempfile = file.bytes().await.unwrap();

        // info!("File: {:?}", tempfile);

        // upload using minio

        let url = state
            .storage
            .upload(&name.0, &kind.0, tempfile.into())
            .await
            .unwrap();

        Json(
            Media::new(&state.database, name.0, url, kind.0)
                .await
                .unwrap(),
        )
    }

    /// /media/:media_id
    ///
    /// Get a Media by `media_id`
    #[oai(path = "/media/:media_id", method = "get", tag = "ApiTags::Media")]
    async fn get_media(
        &self,
        state: Data<&Arc<AppState>>,
        auth: AuthToken,
        media_id: Path<i32>,
    ) -> Result<Json<Media>> {
        Media::get_by_id(&state.database, media_id.0)
            .await
            .or(Err(poem::Error::from_status(
                StatusCode::INTERNAL_SERVER_ERROR,
            )))?
            .ok_or(poem::Error::from_status(StatusCode::NOT_FOUND))
            .map(|x| Json(x))
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
        media_id: Path<i32>,
    ) -> Result<Json<Vec<LinkedItem>>> {
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
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        media_id: Path<i32>,
    ) -> Result<()> {
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
