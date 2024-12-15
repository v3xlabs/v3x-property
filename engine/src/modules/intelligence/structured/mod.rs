
use serde::{Deserialize, Serialize};
use serde_json::Value;
use strategy::Strategy;

pub mod actor;
pub mod strategy;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conversation {
    pub strategy: Strategy,
    pub index: u8,
    pub messages: Vec<ConversationMessage>,
    pub system_instruction: Option<Vec<ConversationMessage>>,
}

pub struct CalculatedResponse {
    pub candidates: Option<Vec<ConversationMessage>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConversationMessage {
    pub role: String,
    pub parts: Vec<ConversationMessagePart>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "content", rename_all = "snake_case")]
pub enum ConversationMessagePart {
    Text(String),
    FunctionCall(String, Value),
    FunctionResponse(String, Value),
}
