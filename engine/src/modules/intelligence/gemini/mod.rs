use std::env;

use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use tracing::info;

pub mod structured;
pub mod actor;

pub struct Gemini {
    api_key: String,

    pub available_models: Vec<GeminiModel>,
}

#[derive(Debug, Serialize, Deserialize, Object, Clone)]
pub struct GeminiModel {
    name: Option<String>,
    #[serde(rename = "baseModelId")]
    base_model_id: Option<String>,
    version: Option<String>,
    #[serde(rename = "displayName")]
    display_name: Option<String>,
    description: Option<String>,
    #[serde(rename = "inputTokenLimit")]
    input_token_limit: Option<u32>,
    #[serde(rename = "outputTokenLimit")]
    _output_token_limit: Option<u32>,
    #[serde(rename = "supportedGenerationMethods")]
    supported_generation_methods: Option<Vec<String>>,
    _temperature: Option<f32>,
    #[serde(rename = "maxTemperature")]
    _max_temperature: Option<f32>,
    #[serde(rename = "topP")]
    _top_p: Option<f32>,
    #[serde(rename = "topK")]
    _top_k: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct GeminiModelsResponse {
    models: Vec<GeminiModel>,
    nextPageToken: Option<String>,
}

impl Gemini {
    pub async fn new(api_key: String) -> Result<Self, anyhow::Error> {
        info!("Gemini Module Initialized");

        let available_models = Gemini::list_models(&api_key).await?;

        Ok(Self {
            api_key,
            available_models,
        })
    }

    pub async fn guess() -> Result<Self, anyhow::Error> {
        let api_key =
            env::var("GEMINI_API_KEY").map_err(|_| anyhow::anyhow!("GEMINI_API_KEY is not set"))?;

        Self::new(api_key).await.map_err(anyhow::Error::from)
    }

    pub async fn list_models(api_key: &str) -> Result<Vec<GeminiModel>, anyhow::Error> {
        let client = reqwest::Client::new();

        let response = client
            .get("https://generativelanguage.googleapis.com/v1beta/models")
            .query(&[("key", api_key)])
            .send()
            .await?;

        // let x = response.text().await?;
        let x: GeminiModelsResponse = response.json().await.unwrap();

        info!(
            "Gemini models: {:?}",
            x.models.iter().map(|m| m.name.clone()).collect::<Vec<_>>()
        );

        // TODO: implement next page token support

        Ok(x.models)
    }

    pub async fn status(&self) -> Result<GeminiStatus, anyhow::Error> {
        Ok(GeminiStatus {
            models: self.available_models.clone(),
        })
    }
}

#[derive(Serialize, Deserialize, Object)]
pub struct GeminiStatus {
    pub models: Vec<GeminiModel>,
}
