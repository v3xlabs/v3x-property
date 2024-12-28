use futures::stream::BoxStream;

use crate::{
    modules::intelligence::{
        actions::SmartActionType,
        gemini::actor::GeminiActor,
        structured::{
            actor::{Actor, ActorEvent},
            strategy::Strategy,
            Conversation, ConversationMessage, ConversationMessagePart,
        },
    },
    state::AppState,
};

pub struct IngressProductTask {
    pub query: String,
}

pub const SYSTEM_PROMPT: &str = include_str!("ingress_product.prompt.md");

impl IngressProductTask {
    pub async fn run<'a>(
        &self,
        state: &AppState,
    ) -> Result<BoxStream<'a, ActorEvent>, anyhow::Error> {
        // let mut actor = OllamaActor;
        let actor = GeminiActor;

        let conversation = Conversation {
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

        let x = actor.prompt(state.clone(), conversation);

        Ok(x)
    }
}
