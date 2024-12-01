use std::env;

use meilisearch_sdk::client::Client;
use tracing::info;

pub struct Search {
    pub client: Client,
}

impl Search {
    pub async fn new(url: String, master_key: Option<String>) -> Result<Self, meilisearch_sdk::errors::Error> {
        let client = Client::new(url, master_key)?;

        let health = client.health().await?;

        info!("Meilisearch is healthy: {:?}", health);

        Ok(Self { client })
    }

    pub async fn guess() -> Result<Self, anyhow::Error> {
        let url = env::var("MEILISEARCH_URL").map_err(|_| anyhow::anyhow!("MEILISEARCH_URL is not set"))?;
        let master_key = env::var("MEILISEARCH_MASTER_KEY").ok();

        Self::new(url, master_key).await.map_err(anyhow::Error::from)
    }
}
