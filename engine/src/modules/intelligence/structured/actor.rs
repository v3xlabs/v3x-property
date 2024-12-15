use crate::{modules::intelligence::{
    actions::SmartActionType, structured::ConversationMessagePart, Intelligence,
}, state::AppState};

use super::{CalculatedResponse, Conversation};

use async_stream::stream;
use async_trait::async_trait;
use futures::{
    stream::{self, BoxStream},
    Stream, StreamExt,
};
use poem_openapi::{payload::Json, Object};
use serde::{Deserialize, Serialize};
use std::{pin::Pin, sync::Arc};
use tracing::{info, warn};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct ActorEvent {
    pub event: String,
    pub data: String,
}

#[async_trait]
pub trait Actor: Send + Sync + Sized {
    async fn calculate(
        &self,
        intelligence: &Intelligence,
        conversation: &Conversation,
        tasks: &[SmartActionType],
    ) -> Result<CalculatedResponse, anyhow::Error>
    where
        Self: Send;

    fn prompt(
        self,
        state: Arc<AppState>,
        conversation: Conversation,
        tasks: Vec<SmartActionType>,
    ) -> BoxStream<'static, ActorEvent>
    where
        Self: 'static,
    {
        Box::pin(async_stream::stream! {
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

                let response = match self.calculate(intelligence, &conversation, &tasks).await {
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
                        event: "candidate".to_string(),
                        data: serde_json::to_string(first_candidate).unwrap(),
                    };
                    // yield Ok(Json(event));
                    yield event;

                    conversation.messages.push(first_candidate.clone());

                    if let Some(part) = first_candidate.parts.first() {
                        match part {
                            ConversationMessagePart::FunctionCall(function_name, function_args) => {
                                warn!("FUNCTION CALLINGGG");
                            }
                            _ => {}
                        }
                    }
                }
            }
        })
    }
}
