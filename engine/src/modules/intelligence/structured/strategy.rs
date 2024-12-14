use serde::{Deserialize, Serialize};
use super::Conversation;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Strategy {
    /// 8 rounds max
    /// forces the first round to be a UPC search
    UPCForcedSearch,
    /// 8 rounds max
    Basic
}

#[derive(Debug, Clone)]
pub struct StrategyConfig {
    pub max_rounds: u8,
}

impl Strategy {
    pub async fn compute(&self, conversation: &Conversation) -> Result<StrategyConfig, anyhow::Error> {
        Ok(StrategyConfig {
            max_rounds: 8,
        })
    }
}
