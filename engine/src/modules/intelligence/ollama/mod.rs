use std::env;

use poem_openapi::Object;
use ollama_rs::Ollama as OllamaClient;
use serde::{Deserialize, Serialize};
use tracing::info;

pub mod actor;

pub struct Ollama {
    pub ollama: OllamaClient,
}

impl Ollama {
    pub async fn new(url: String, port: u16) -> Result<Self, anyhow::Error> {
        let ollama = OllamaClient::new(url, port);

        let models: Vec<String> = ollama
            .list_local_models()
            .await?
            .iter()
            .map(|m| m.name.clone())
            .collect();

        info!("Ollama models detected: {:?}", models);

        Ok(Self { ollama })
    }

    pub async fn guess() -> Result<Self, anyhow::Error> {
        let url = env::var("OLLAMA_URL").map_err(|_| anyhow::anyhow!("OLLAMA_URL is not set"))?;
        let port = env::var("OLLAMA_PORT")
            .map_err(|_| anyhow::anyhow!("OLLAMA_PORT is not set"))?
            .parse::<u16>()
            .map_err(|_| anyhow::anyhow!("OLLAMA_PORT is not a valid u16"))?;

        Self::new(url, port).await.map_err(anyhow::Error::from)
    }

    pub async fn status(&self) -> Result<OllamaStatus, anyhow::Error> {
        let models: Vec<String> = self
            .ollama
            .list_local_models()
            .await?
            .iter()
            .map(|m| m.name.clone())
            .collect();

        Ok(OllamaStatus { models })
    }
}

#[derive(Serialize, Deserialize, Object)]
pub struct OllamaStatus {
    pub models: Vec<String>,
}
