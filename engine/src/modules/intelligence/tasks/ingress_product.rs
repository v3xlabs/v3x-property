use std::sync::Arc;

use serde_json::{json, Value};
use tracing::info;

use super::super::gemini::structured::*;
use crate::{modules::intelligence::{actions::{kagi::SearchKagiTask, SmartActionType}, gemini::actor::GeminiActor, ollama::actor::OllamaActor, structured::{actor::Actor, strategy::Strategy, Conversation, ConversationMessage, ConversationMessagePart}}, state::AppState};

pub struct IngressProductTask {
    pub query: String,
}

pub const SYSTEM_PROMPT: &str = include_str!("ingress_product.prompt.md");

impl IngressProductTask {
    pub async fn run(&self, state: &Arc<AppState>) -> Result<(), anyhow::Error> {
        // let gemini = state
        //     .intelligence
        //     .as_ref()
        //     .unwrap()
        //     .gemini
        //     .as_ref()
        //     .unwrap();

        // let mut actor = OllamaActor {};
        let mut actor = GeminiActor::init(state, None, vec![]).await?;

        // let mut actor = GeminiActor::init(
        //     state,
        //     Some(GeminiStructuredContentRequestPart {
        //         role: "user".to_string(),
        //         parts: vec![GeminiStructuredContentRequestPartPart {
        //             text: Some(SYSTEM_PROMPT.to_string()),
        //             function_call: None,
        //             function_response: None,
        //         }],
        //     }),
        //     vec![
        //         GeminiStructuredContentRequestPart {
        //             role: "user".to_string(),
        //             parts: vec![GeminiStructuredContentRequestPartPart {
        //                 text: Some(self.query.clone()),
        //                 function_call: None,
        //                 function_response: None,
        //             }],
        //         },
        //     ],
        // )
        // .await
        // .unwrap();

        // let x = actor.prompt(state).await.unwrap();

        let mut conversation = Conversation {
            strategy: Strategy::Basic,
            index: 0,
            messages: vec![ConversationMessage {
                role: "user".to_string(),
                parts: vec![ConversationMessagePart::Text(self.query.clone())],
            }],
            system_instruction: Some(vec![ConversationMessage {
                role: "user".to_string(),
                parts: vec![ConversationMessagePart::Text(SYSTEM_PROMPT.to_string())],
            }]),
        };

        let tasks = vec![
            SmartActionType::SearchUPCEAN,
            SmartActionType::SearchKagi,
            SmartActionType::ExtractLDJSON,
        ];

        let x = actor.prompt(state.intelligence.as_ref().unwrap(), &mut conversation, &tasks).await?;

        info!("response: {:?}", x);

        todo!();
        // let response = gemini
        //     .structured_content::<Value>(&GeminiStructuredContentRequest {
        //         contents: vec![GeminiStructuredContentRequestPart {
        //             role: "user".to_string(),
        //             parts: vec![GeminiStructuredContentRequestPartPart {
        //                 text: self.query.clone(),
        //             }],
        //         }],
        //         system_instruction: Some(GeminiStructuredContentRequestPart {
        //             role: "user".to_string(),
        //             parts: vec![GeminiStructuredContentRequestPartPart {
        //                 text: SYSTEM_PROMPT.to_string(),
        //             }],
        //         }),
        //         /*
        //                  "function_declarations": [
        //               {
        //                 "name": "search_upc",
        //                 "description": "Search UPC Database by UPC",
        //                 "parameters": {"type": "object", "properties": {"upc": { "type": "string", "description": "The UPC to lookup"}}}
        //             }
        //         ]
        //                  */
        //         tools: Some(GeminiStructuredContentRequestTool {
        //             function_declarations: vec![GeminiStructuredContentRequestFunctionDeclaration {
        //                 name: "search_upc".to_string(),
        //                 description: "Search UPC Database by UPC".to_string(),
        //                 parameters: GeminiStructuredContentRequestFunctionDeclarationParameters {
        //                     _type: "object".to_string(),
        //                     properties: GeminiStructuredContentRequestFunctionDeclarationParametersProperties {
        //                         upc: GeminiStructuredContentRequestFunctionDeclarationParametersPropertiesRgbHex {
        //                             _type: "string".to_string(),
        //                             description: "The UPC to lookup".to_string(),
        //                         },
        //                     },
        //                 },
        //             }],
        //         }),
        //         tool_config: Some(GeminiStructuredContentRequestToolConfig {
        //             function_calling_config: GeminiStructuredContentRequestToolConfigFunctionCallingConfig {
        //                 mode: "AUTO".to_string(),
        //             },
        //         }),
        //         // tools: None,
        //         generation_config: None,
        //         // generation_config: GeminiStructuredContentGenerationConfig {
        //         //     response_mime_type: "text/plain".to_string(),
        //         //     // response_mime_type: "application/json".to_string(),
        //         // },
        //     })
        //     .await?;

        // info!("response: {}", serde_json::to_string_pretty(&response)?);

        Ok(())
    }
}
