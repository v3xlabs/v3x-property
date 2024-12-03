use std::sync::Arc;

use aws_config::{BehaviorVersion, Region};
use aws_sdk_s3::config::{Credentials, ProvideCredentials, SharedCredentialsProvider};
use poem::{
    web::{Data, Multipart, Path, Query},
    Result,
};
use poem_openapi::{payload::Json, Object, OpenApi};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{auth::middleware::AuthToken, models::media::Media, state::AppState};

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
        let tempfile = file.bytes().await.unwrap();

        // info!("File: {:?}", tempfile);

        // upload using minio

        let config = aws_config::defaults(BehaviorVersion::latest())
            .endpoint_url("http://localhost:9000")
            .region(Region::new("us-east-1"))
            .credentials_provider(Credentials::new(
                "minioadmin",
                "minioadmin",
                None,
                None,
                "static",
            ))
            .load()
            .await;

        let client = aws_sdk_s3::Client::new(&config);
        let bucket_name = "test";


        let buckets = client.list_buckets().send().await.unwrap();

        // if bucket does not exist, create it
        if !buckets.buckets().iter().any(|x| x.name().unwrap() == bucket_name) {
            client.create_bucket()
                .bucket(bucket_name)
                .send()
                .await
                .unwrap();
        }
    
        let clientz = client
            .put_object()
            .bucket(bucket_name)
            .key(format!(
                "{}.{}",
                request.0.name.as_ref().unwrap(),
                request.0.kind.as_ref().unwrap()
            ))
            .body(tempfile.into())
            .send()
            .await
            .unwrap();

        info!("Clientz: {:?}", clientz);

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
