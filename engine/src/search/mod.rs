use std::env;

use bigdecimal::ToPrimitive;
use meilisearch_sdk::{client::Client, tasks::Task};
use tracing::info;

use crate::{
    database::Database,
    models::{item::search::SearchableItem, search::SearchTask},
};

pub struct Search {
    pub client: Client,
}

impl Search {
    pub async fn new(
        url: String,
        master_key: Option<String>,
    ) -> Result<Self, meilisearch_sdk::errors::Error> {
        let client = Client::new(url, master_key)?;

        let health = client.health().await?;

        info!("Meilisearch is healthy: {:?}", health);

        Ok(Self { client })
    }

    pub async fn guess() -> Result<Self, anyhow::Error> {
        let url = env::var("MEILISEARCH_URL")
            .map_err(|_| anyhow::anyhow!("MEILISEARCH_URL is not set"))?;
        let master_key = env::var("MEILISEARCH_MASTER_KEY").ok();

        Self::new(url, master_key)
            .await
            .map_err(anyhow::Error::from)
    }

    pub async fn index_item(&self, db: &Database, item: &SearchableItem) -> Result<(), ()> {
        let x = self
            .client
            .index("items")
            .add_documents(&[item], None)
            .await
            .unwrap();

        SearchTask::new(db, x.task_uid, x.status.into())
            .await
            .unwrap();

        Ok(())
    }

    pub async fn refresh_task(
        &self,
        db: &Database,
        task_external_id: i64,
    ) -> Result<SearchTask, sqlx::Error> {
        let task_id_ref: u32 = task_external_id as u32;

        let x = self
            .client
            .get_task(TempVal { x: task_id_ref })
            .await
            .unwrap();

        SearchTask::refresh(db, task_external_id, x.into()).await
    }
}

// TODO: figure out why this is needed
pub struct TempVal {
    pub x: u32,
}

impl AsRef<u32> for TempVal {
    fn as_ref(&self) -> &u32 {
        &self.x
    }
}
