use crate::{
    modules::intelligence::{
        actions::{
            kagi::SearchKagiTask, ldjson::ExtractLDJsonTask, upcitemdb::SearchUPCEANDatabaseTask,
            SmartAction,
        },
        structured::ConversationMessagePart,
        Intelligence,
    },
    state::AppState,
};

use super::{CalculatedResponse, Conversation, ConversationMessage};

use super::strategy::StrategyConfig;
use async_trait::async_trait;
use futures::stream::BoxStream;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tracing::{info, warn};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct ActorEvent {
    pub event: String,
    pub data: Value,
}

#[async_trait]
pub trait Actor: Send + Sync + Sized {
    async fn calculate(
        &self,
        intelligence: &Intelligence,
        conversation: &Conversation,
        strategy: &StrategyConfig,
    ) -> Result<CalculatedResponse, anyhow::Error>
    where
        Self: Send;

    fn prompt(
        self,
        state: AppState,
        conversation: Conversation,
    ) -> BoxStream<'static, ActorEvent>
    where
        Self: 'static,
    {
        Box::pin(async_stream::stream! {
            yield ActorEvent {
                event: "hello".to_string(),
                data: Value::String("starting".to_string()),
            };

            let mut conversation = conversation.clone();
            #[allow(clippy::await_holding_refcell_ref)]
            loop {
                let intelligence = state.intelligence.as_ref().unwrap();
                let strategy = match conversation.strategy.compute(&conversation).await {
                    Ok(strategy) => strategy,
                    Err(_error) => {
                        // yield Err("Strategy computation failed".to_string());
                        break;
                    }
                };

                let response = match self.calculate(intelligence, &conversation, &strategy).await {
                    Ok(response) => response,
                    Err(e) => {
                        // yield Err("Calculation failed".to_string());
                        break;
                    }
                };

                conversation.index += 1;
                if conversation.index >= strategy.max_rounds {
                    break;
                }

                if let Some(candidates) = response.candidates {
                    info!("candidates: {:?}", candidates);

                    let first_candidate = candidates.first().unwrap();

                    if candidates.len() > 1 {
                        warn!("more than one candidate, only taking the first one");
                    }

                    let event = ActorEvent {
                        event: "conversation_message".to_string(),
                        data: serde_json::to_value(first_candidate).unwrap(),
                    };
                    // yield Ok(Json(event));
                    yield event;

                    conversation.messages.push(first_candidate.clone());

                    if let Some(part) = first_candidate.parts.first() {
                        // TODO: verify part is a permitted function to call

                        match part {
                            ConversationMessagePart::FunctionCall(function_name, function_args) => {
                                warn!("FUNCTION CALLINGGG");
                                let function_name = function_name.to_string();
                                match function_name.as_str() {
                                    "search_kagi" => {
                                        let search_kagi_body = SearchKagiTask {
                                            query: function_args.to_string(),
                                        };

                                        let result = search_kagi_body.execute().await.unwrap();

                                        let event = ActorEvent {
                                            event: "function_response".to_string(),
                                            data: serde_json::to_value(&result).unwrap(),
                                        };

                                        yield event;

                                        conversation.messages.push(result);
                                    },
                                    "extract_ldjson" => {
                                        let extract_ldjson_body = ExtractLDJsonTask {
                                            query: function_args.as_str().unwrap().to_string(),
                                        };

                                        match extract_ldjson_body.execute().await {
                                            Ok(result) => {
                                                let event = ActorEvent {
                                                    event: "function_response".to_string(),
                                                    data: serde_json::to_value(&result).unwrap(),
                                                };
                                                yield event;

                                                conversation.messages.push(result);
                                            },
                                            Err(error) => {
                                                info!("failed to extract ldjson {:?}", error);

                                                let message = ConversationMessage {
                                                    role: "user".to_string(),
                                                    parts: vec![ConversationMessagePart::Text(
                                                        "Failed to extract LD+JSON".to_string(),
                                                    )],
                                                };

                                                let event = ActorEvent {
                                                    event: "function_response".to_string(),
                                                    data: serde_json::to_value(&message).unwrap(),
                                                };
                                                yield event;

                                                conversation.messages.push(message);
                                            }
                                     }
                                },
                                    "search_upc_database" => {
                                        let search_upc_database_body = SearchUPCEANDatabaseTask {
                                            upc: function_args.to_string(),
                                        };

                                        let result = search_upc_database_body.execute().await.unwrap();

                                        let event = ActorEvent {
                                            event: "function_response".to_string(),
                                            data: serde_json::to_value(&result).unwrap(),
                                        };

                                        yield event;

                                        conversation.messages.push(result);
                                    },
                                    _ => {
                                        warn!("unknown function call: {}", function_name);
                                    }
                                }
                            },
                            ConversationMessagePart::Text(part) => {
                                info!("Reached conclusion {}", part);
                                break;
                            }
                            _ => {}
                        }
                    }
                }
            }

            yield ActorEvent {
                event: "conversation_complete".to_string(),
                data: Value::String("conversation_complete".to_string()),
            };
        })
    }
}
