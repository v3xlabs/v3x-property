use std::env;

use ollama_rs::Ollama;
use tracing::info;

pub struct Intelligence {
    pub ollama: Ollama,
}

impl Intelligence {
    pub async fn new(url: String, port: u16) -> Result<Self, anyhow::Error> {
        let ollama = Ollama::new(url, port);

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
}
