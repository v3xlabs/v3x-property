use std::fmt::Display;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use serde_with::SerializeDisplay;
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

// impl Display for ConversationMessagePart {
//     fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
//         write!(f, "{}", self.to_string())
//     }
// }

// impl Into<String> for ConversationMessagePart {
//     fn into(self) -> String {
//         match self {
//             ConversationMessagePart::Text(text) => text,
//             ConversationMessagePart::FunctionCall(function_call, ) => function_call,
//             ConversationMessagePart::FunctionResponse(function_response) => function_response,
//         }
//     }
// }