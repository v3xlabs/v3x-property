use std::sync::Arc;

use minio::s3::{
    args::{CreateMultipartUploadArgs, MakeBucketArgs, UploadObjectArgs}, client::ClientBuilder, creds::StaticProvider, http::BaseUrl,
};
use poem::{
    web::{Data, Multipart, Path, Query},
    Result,
};
use poem_openapi::{payload::Json, Object, OpenApi};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{auth::middleware::AuthToken, models::media::Media, state::AppState};
use minio::s3::builders::ObjectContent;

pub struct MediaApi;

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct MediaIdResponse {
    media_id: String,
}

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct CreateMediaRequest {
    name: Option<String>,
    kind: Option<String>,
}

#[OpenApi]
impl MediaApi {
    #[oai(path = "/media/:media_id", method = "get")]
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

    #[oai(path = "/media/:media_id", method = "delete")]
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

    #[oai(path = "/media", method = "get")]
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

    #[oai(path = "/media", method = "post")]
    async fn create_media(
        &self,
        auth: AuthToken,
        state: Data<&Arc<AppState>>,
        request: Query<CreateMediaRequest>,
        mut upload: Multipart,
    ) -> Json<Media> {
        let file = upload.next_field().await.unwrap().unwrap();
        let tempfile = file.tempfile().await.unwrap();

        info!("File: {:?}", tempfile);

        // upload using minio

        let base_url: BaseUrl = "http://localhost:9000".parse().unwrap();
        let static_provider = StaticProvider::new("minioadmin", "minioadmin", None);
        let client = ClientBuilder::new(base_url)
            .provider(static_provider)
            .build()
            .unwrap();

        let bucket_name = "test";

        if !client.bucket_exists(bucket_name).await.unwrap() {
            client
                .make_bucket(&MakeBucketArgs {
                    bucket: bucket_name,
                    ..Default::default()
                })
                .await
                .unwrap();
        }

        let content = ObjectContent::from_file(tempfile).unwrap();

        let url = "".to_string();

        Json(
            Media::new(
                &state.database,
                request.0.name.unwrap(),
                url,
                request.0.kind.unwrap(),
            )
            .await
            .unwrap(),
        )
    }
}
