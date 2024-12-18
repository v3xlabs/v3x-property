use s3::creds::Credentials;
use s3::Bucket;
use s3::Region;
use std::env;
use uuid::Uuid;

pub struct Storage {
    pub endpoint_url: String,
    pub bucket: Box<Bucket>,
    pub bucket_name: String,
}

impl Storage {
    pub fn new(
        endpoint_url: String,
        region: String,
        bucket_name: String,
        access_key: String,
        secret_key: String,
    ) -> Self {
        let credentials =
            Credentials::new(Some(&access_key), Some(&secret_key), None, None, None).unwrap();
        let region = Region::Custom {
            region,
            endpoint: endpoint_url.clone(),
        };
        let bucket = Bucket::new(&bucket_name, region, credentials)
            .unwrap()
            .with_path_style();

        Self {
            endpoint_url,
            bucket,
            bucket_name,
        }
    }

    pub async fn guess() -> Self {
        let endpoint_url =
            env::var("S3_ENDPOINT_URL").unwrap_or("http://localhost:9000".to_string());
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
        file: Vec<u8>,
    ) -> Result<String, anyhow::Error> {
        let file_extension = name.split('.').last().unwrap();

        self.ensure_bucket().await?;

        let uuid = Uuid::new_v4();
        let url = format!("{}.{}", uuid, file_extension);

        self.bucket.put_object(&url, &file).await?;

        Ok(url)
    }

    async fn ensure_bucket(&self) -> Result<(), anyhow::Error> {
        // let buckets = self.bucket.list("".to_string(), None).await?;

        // info!("Buckets: {:?}", buckets);

        // // if bucket does not exist, create it
        // if !buckets.iter().any(|x| x.name == self.bucket_name) {
        //     self.().await?;
        // }

        Ok(())
    }

    // Gets the total bucket size in bytes and the total number of files in the bucket
    pub async fn stat_bucket(&self) -> Result<(u64, u64), anyhow::Error> {
        let bucket_size = self.bucket.list("".to_string(), None).await?;

        let mut total_files = 0;
        let mut total_size = 0;

        for object in bucket_size {
            // let size = object.size;
            // let file_count += 1;
            for content in object.contents {
                let size = content.size;

                total_size += size;
                total_files += 1;
            }
        }

        Ok((total_files, total_size))
    }
}
