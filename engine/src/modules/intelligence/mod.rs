use gemini::{Gemini, GeminiStatus};
use ollama::{Ollama, OllamaStatus};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};

pub mod gemini;
pub mod ollama;
pub mod actions;
pub mod tasks;
pub mod structured;

pub struct Intelligence {
    pub ollama: Option<Ollama>,
    pub gemini: Option<Gemini>,
}

impl Intelligence {
    pub fn new(ollama: Option<Ollama>, gemini: Option<Gemini>) -> Self {
        Self { ollama, gemini }
    }

    pub async fn guess() -> Result<Self, anyhow::Error> {
        let ollama = Ollama::guess().await.ok();
        let gemini = Gemini::guess().await.ok();

        if ollama.is_none() && gemini.is_none() {
            anyhow::bail!("No intelligence modules found");
        }

        Ok(Self::new(ollama, gemini))
    }

    pub async fn status(&self) -> Result<IntelligenceStatus, anyhow::Error> {
        let ollama = if let Some(ollama) = &self.ollama {
            Some(ollama.status().await?)
        } else {
            None
        };

        let gemini = if let Some(gemini) = &self.gemini {
            Some(gemini.status().await?)
        } else {
            None
        };

        Ok(IntelligenceStatus { ollama, gemini })
    }
}

#[derive(Serialize, Deserialize, Object)]
pub struct IntelligenceStatus {
    pub ollama: Option<OllamaStatus>,
    pub gemini: Option<GeminiStatus>,
}
