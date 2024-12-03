use std::env;

use tracing::info;
use aws_config::Region;
use aws_sdk_s3::{config::Credentials, primitives::ByteStream, types::CreateBucketConfiguration, Client};
use uuid::Uuid;

pub struct Storage {
    client: Client,
    bucket_name: String,
}

impl Storage {
    pub fn new(
        endpoint_url: String,
        region: String,
        bucket_name: String,
        access_key: String,
        secret_key: String,
    ) -> Self {
        let config = aws_sdk_s3::Config::builder()
            .endpoint_url(endpoint_url)
            .region(Region::new(region))
            .credentials_provider(Credentials::new(
                access_key,
                secret_key,
                None,
                None,
                "static",
            ))
            .behavior_version_latest()
            .force_path_style(true)
            .build();

        let client = Client::from_conf(config);

        Self { client, bucket_name }
    }

    pub async fn guess() -> Self {
        let endpoint_url = env::var("S3_ENDPOINT_URL").unwrap_or("http://localhost:9000".to_string());
        let region = env::var("S3_REGION").unwrap_or("us-east-1".to_string());
        let bucket_name = env::var("S3_BUCKET_NAME").unwrap_or("property".to_string());
        let access_key = env::var("S3_ACCESS_KEY").unwrap_or("minioadmin".to_string());
        let secret_key = env::var("S3_SECRET_KEY").unwrap_or("minioadmin".to_string());

        Storage::new(endpoint_url, region, bucket_name, access_key, secret_key)
    }

    pub async fn upload(
        &self,
        name: &str,
        kind: &str,
        file: ByteStream,
    ) -> Result<String, anyhow::Error> {
        let file_extension = name.split('.').last().unwrap();

        let buckets = self.client.list_buckets().send().await.unwrap();

        info!("Buckets: {:?}", buckets);

        // if bucket does not exist, create it
        if !buckets
            .buckets()
            .iter()
            .any(|x| x.name().unwrap() == self.bucket_name)
        {
            self.client
                .create_bucket()
                .create_bucket_configuration(CreateBucketConfiguration::builder().build())
                .bucket(&self.bucket_name)
                .send()
                .await
                .unwrap();
        }

        let uuid = Uuid::new_v4();
        let url = format!("{}.{}", uuid, file_extension);

        let put_object_output = self.client
            .put_object()
            .bucket(&self.bucket_name)
            .key(&url)
            .content_type(kind)
            .body(file)
            .send()
            .await
            .unwrap();

        Ok(url)
    }
}
