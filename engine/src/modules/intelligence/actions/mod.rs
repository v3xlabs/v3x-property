
use kagi::SearchKagiTask;
use ldjson::ExtractLDJsonTask;
use serde::{Deserialize, Serialize};
use upcitemdb::SearchUPCEANDatabaseTask;

use super::structured::ConversationMessage;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SmartActionType {
    SearchUPCEAN,
    SearchKagi,
    ExtractLDJSON,
}

impl SmartActionType {
    pub fn as_definition(&self) -> SmartActionDefinition {
        match self {
            SmartActionType::SearchUPCEAN => SearchUPCEANDatabaseTask::as_definition(),
            SmartActionType::SearchKagi => SearchKagiTask::as_definition(),
            SmartActionType::ExtractLDJSON => ExtractLDJsonTask::as_definition(),
        }
    }
}

pub trait SmartAction: Sized {
    async fn execute(&self) -> Result<ConversationMessage, anyhow::Error>;
    fn as_definition() -> SmartActionDefinition;
    fn name() -> String;
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SmartActionDefinition {
    pub name: String,
    pub description: String,
    pub parameters: SmartActionParameters,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SmartActionParameters {
    #[serde(rename = "type")]
    pub _type: String,
    pub properties: SmartActionParametersProperties,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SmartActionParametersProperties {
    pub query: SmartActionParametersPropertiesProperties,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SmartActionParametersPropertiesProperties {
    #[serde(rename = "type")]
    pub _type: String,
    pub description: String,
}

pub mod upcitemdb;
pub mod kagi;
pub mod ldjson;
