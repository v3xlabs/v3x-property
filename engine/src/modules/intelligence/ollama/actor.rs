
use ollama_rs::generation::chat::{ChatMessage, MessageRole};

use crate::modules::intelligence::structured::{ConversationMessage, ConversationMessagePart};

pub struct OllamaActor {}

// impl Actor for OllamaActor {
//     async fn calculate(
//         intelligence: &crate::modules::intelligence::Intelligence,
//         conversation: &crate::modules::intelligence::structured::Conversation,
//         tasks: &[SmartActionType],
//     ) -> Result<crate::modules::intelligence::structured::CalculatedResponse, anyhow::Error> {
//         // let body: Ollama
//         info!("Calculating response");
//         let request = ChatMessageRequest::new(
//             "qwen2.5:3b".to_string(),
//             // conversation
//             //     .messages
//             //     .iter()
//             //     .map(|m| {
//             //         let x: ChatMessage = m.into();
//             //         x
//             //     })
//             //     .collect(),
//             vec![],
//         );
//         info!("Request: {:?}", request);

//         let ollama = intelligence.ollama.as_ref().unwrap();

//         // ollama.ollama.send_chat_messages(request)
//         // let response = ollama.ollama.send_chat_messages(request).await.unwrap();

//         todo!()
//     }
// }

impl From<ConversationMessage> for ChatMessage {
    fn from(value: ConversationMessage) -> Self {
        ChatMessage {
            role: match value.role.as_str() {
                "user" => MessageRole::User,
                "assistant" => MessageRole::Assistant,
                "system" => MessageRole::System,
                _ => MessageRole::User,
            },
            content: value
                .parts
                .iter()
                .map(|p| match p {
                    ConversationMessagePart::Text(text) => text.clone(),
                    ConversationMessagePart::FunctionCall(function_name, function_args) => {
                        format!("{}: {}", function_name, function_args)
                    }
                    ConversationMessagePart::FunctionResponse(function_name, function_response) => {
                        format!("{}: {}", function_name, function_response)
                    }
                })
                .collect::<Vec<String>>()
                .join("\n"),
            images: None,
        }
    }
}

// impl Into<ChatMessage> for ConversationMessage {
//     fn into(self) -> ChatMessage {
//         ChatMessage {
//             role: match self.role.as_str() {
//                 "user" => MessageRole::User,
//                 "assistant" => MessageRole::Assistant,
//                 "system" => MessageRole::System,
//                 _ => MessageRole::User,
//             },
//             content: self
//                 .parts
//                 .iter()
//                 .map(|p| p.deref().to_string())
//                 .collect::<Vec<_>>(),
//             images: None,
//         }
//     }
// }
