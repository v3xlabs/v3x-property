use std::env;

use meilisearch_sdk::{client::Client, settings::Settings};
use serde_json::json;
use tracing::info;

use crate::{
    database::Database,
    intelligence::Intelligence,
    models::{
        item::{search::SearchableItem, Item},
        search::SearchTask,
    },
};

pub struct Search {
    pub client: Client,
}

impl Search {
    pub async fn new(
        url: String,
        master_key: Option<String>,
        intelligence: &Option<Intelligence>,
    ) -> Result<Self, meilisearch_sdk::errors::Error> {
        let client = Client::new(url.clone(), master_key.clone())?;

        let health = client.health().await?;

        info!("Meilisearch is healthy: {:?}", health);

        let skip_embeddings = env::var("MEILISEARCH_SKIP_EMBEDDINGS")
            .unwrap_or("false".to_string())
            .to_lowercase()
            == "true";

        if !skip_embeddings {
            if let Some(intelligence) = intelligence {
                let x = intelligence
                    .ollama
                    .pull_model("all-minilm".to_string(), false)
                    .await
                    .unwrap();

                info!("Model pulled: {:?}", x);

                // TODO: check if embeddings are already enabled on meilisearch
                // you have to manually enable vectorStore (experimental feature)
                let response = reqwest::Client::new()
                    .patch(format!("{}/indexes/items/settings", url))
                    .json(&json!({
                        "embedders": {
                            "ollama": {
                                "source": "ollama",
                                "url": format!("{}/api/embeddings", intelligence.ollama.url()),
                                "model": "all-minilm",
                                "documentTemplate": "{{doc.name}}",
                                "dimensions": 384
                            }
                        }
                    }))
                    .header(
                        "Authorization",
                        format!("Bearer {}", &master_key.clone().unwrap_or("".to_string())),
                    )
                    .send()
                    .await?;

                info!("Embeddings enabled: {:?}", response);
            }
        }

        Ok(Self { client })
    }

    pub async fn guess(intelligence: &Option<Intelligence>) -> Result<Self, anyhow::Error> {
        let url = env::var("MEILISEARCH_URL")
            .map_err(|_| anyhow::anyhow!("MEILISEARCH_URL is not set"))?;
        let master_key = env::var("MEILISEARCH_MASTER_KEY").ok();

        Self::new(url, master_key, intelligence)
            .await
            .map_err(anyhow::Error::from)
    }

    pub async fn index_item(&self, db: &Database, item: &SearchableItem) -> Result<(), ()> {
        let x = self
            .client
            .index("items")
            .add_documents(&[item], Some("item_id"))
            .await
            .unwrap();

        SearchTask::new(db, x.task_uid, x.status.into())
            .await
            .unwrap();

        Ok(())
    }

    pub async fn index_all_items(&self, db: &Database) -> Result<(), ()> {
        let items = Item::get_all(db).await.unwrap();

        // batch by 10 (artificial TODO: implement sql paging)
        let batches = items.chunks(10);

        for batch in batches {
            let x = self
                .client
                .index("items")
                .add_documents(batch, Some("item_id"))
                .await
                .unwrap();

            SearchTask::new(db, x.task_uid, x.status.into())
                .await
                .unwrap();
        }

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

        SearchTask::refresh(db, task_external_id, x).await
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
