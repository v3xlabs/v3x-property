use crate::modules::intelligence::{
    actions::{SmartAction, SmartActionType}, structured::ConversationMessagePart, Intelligence,
};

use super::{CalculatedResponse, Conversation, ConversationMessage};
use tracing::{info, warn};

pub trait Actor {
    async fn calculate(
        &self,
        intelligence: &Intelligence,
        conversation: &Conversation,
        tasks: &[SmartActionType],
    ) -> Result<CalculatedResponse, anyhow::Error>;

    async fn prompt(
        &self,
        intelligence: &Intelligence,
        conversation: &mut Conversation,
        tasks: &[SmartActionType],
    ) -> Result<ConversationMessage, anyhow::Error> {
        loop {
            let strategy = conversation.strategy.compute(conversation).await?;

            // TODO: modify tasks according to strategy
            // let tasks = tasks;

            let response = self.calculate(intelligence, conversation, tasks).await?;

            conversation.index += 1;

            if conversation.index >= strategy.max_rounds {
                return Err(anyhow::anyhow!("max rounds reached"));
            }

            if let Some(candidates) = response.candidates {
                // conversation.messages.push(candidates);
                info!("candidates: {:?}", candidates);

                // take the first candidate
                let first_candidate = candidates.first().unwrap();

                // if we have more candidates announce it as a warn
                if candidates.len() > 1 {
                    warn!("more than one candidate, only taking the first one");
                }

                // add the first candidate to the conversation
                conversation.messages.push(first_candidate.clone());

                // if the candidate is a function call, we need to call it
                if let Some(part) = first_candidate.parts.first() {
                    match part {
                        ConversationMessagePart::FunctionCall(function_name, function_args) => {
                            warn!("FUNCTION CALLINGGG");
                            // call the function
                            // let response = self.call_function(intelligence, function_call).await?;
                            // add the response to the conversation
                            // conversation.messages.push(response);
                        }
                        _ => {}
                    }
                }

                return Ok(first_candidate.clone());
            }
        }
    }
}
