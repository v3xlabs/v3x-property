use std::env;

use meilisearch_sdk::client::Client;
use serde_json::json;
use tracing::info;

use crate::{
    database::Database,
    models::{
        item::{search::SearchableItem, Item},
        search::SearchTask,
    },
    modules::intelligence::Intelligence,
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
                    .pull_model("nomic-embed-text".to_string(), false)
                    .await
                    .unwrap();

                info!("Model pulled: {:?}", x);

                let client = reqwest::Client::new();

                let response = client
                    .patch(format!("{}/experimental-features/", url))
                    .json(&json!({
                        "vectorStore": true
                    }))
                    .header(
                        "Authorization",
                        format!("Bearer {}", &master_key.clone().unwrap_or("".to_string())),
                    )
                    .send()
                    .await?;

                info!("Vector store enabled: {:?}", response.text().await.unwrap());

                // TODO: check if embeddings are already enabled on meilisearch
                // you have to manually enable vectorStore (experimental feature)
                let response = client
                    .patch(format!("{}/indexes/items/settings", url))
                    .json(&json!({
                        "embedders": {
                            "ollama": {
                                "source": "ollama",
                                "url": intelligence
                                    .ollama
                                    .url()
                                    .join("/api/embeddings")
                                    .unwrap()
                                    .to_string(),
                                "model": "nomic-embed-text",
                                "documentTemplate": "{{doc.name}}",
                                "dimensions": 768
                            }
                        }
                    }))
                    .header(
                        "Authorization",
                        format!("Bearer {}", &master_key.clone().unwrap_or("".to_string())),
                    )
                    .send()
                    .await?;

                info!("Embeddings enabled: {:?}", response.text().await.unwrap());
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
        task_id: i32,
    ) -> Result<SearchTask, sqlx::Error> {
        let internal_task = SearchTask::find_by_id(db, task_id).await.unwrap();

        let task = self
            .client
            .get_task(TempVal {
                x: internal_task.external_task_id as u32,
            })
            .await
            .unwrap();

        SearchTask::refresh(db, task_id, internal_task.external_task_id, task).await
    }
}

pub struct TempVal {
    pub x: u32,
}

impl AsRef<u32> for TempVal {
    fn as_ref(&self) -> &u32 {
        &self.x
    }
}
