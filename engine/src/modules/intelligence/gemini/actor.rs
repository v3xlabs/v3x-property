use async_trait::async_trait;
use serde_json::Value;

use crate::modules::intelligence::{
    gemini::structured::GeminiStructuredContentResponse,
    structured::{actor::Actor, strategy::StrategyConfig, CalculatedResponse, Conversation},
    Intelligence,
};

use super::structured::GeminiStructuredContentRequest;

pub struct GeminiActor;

#[async_trait]
impl Actor for GeminiActor {
    async fn calculate(
        &self,
        intelligence: &Intelligence,
        conversation: &Conversation,
        strategy: &StrategyConfig,
    ) -> Result<CalculatedResponse, anyhow::Error> {
        let body = GeminiStructuredContentRequest::from_conversation(conversation, strategy);

        let client = reqwest::Client::new();
        let api_key = intelligence.gemini.as_ref().unwrap().api_key.as_str();

        let response = client.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent")
        .query(&[("key", api_key)])
        .json(&body)
        .send()
        .await?;

        let raw_response: Value = response.json().await?;

        let response: GeminiStructuredContentResponse =
            serde_json::from_value(raw_response.clone()).unwrap();

        let output: CalculatedResponse = response.into();

        Ok(output)
    }
}
