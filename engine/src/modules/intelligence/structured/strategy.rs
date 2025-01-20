use crate::modules::intelligence::actions::{
    kagi::SearchKagiTask, ldjson::ExtractLDJsonTask, upcitemdb::SearchUPCEANDatabaseTask,
    SmartAction, SmartActionType,
};
use serde::{Deserialize, Serialize};
use serde_with::SerializeDisplay;

use super::Conversation;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Strategy {
    /// 8 rounds max
    /// forces the first round to be a UPC search
    UPCForcedSearch,
    /// 8 rounds max
    Basic,
    /// 8 rounds max
    ProductOptimized,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FunctionMode {
    #[serde(rename = "ANY")]
    Any,
    #[serde(rename = "AUTO")]
    Auto,
    #[serde(rename = "NONE")]
    None,
}

impl ToString for FunctionMode {
    fn to_string(&self) -> String {
        match self {
            FunctionMode::Any => "ANY".to_string(),
            FunctionMode::Auto => "AUTO".to_string(),
            FunctionMode::None => "NONE".to_string(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct StrategyConfig {
    pub max_rounds: u8,
    pub allowed_functions: Option<Vec<String>>,
    pub tasks: Vec<SmartActionType>,
    pub function_mode: Option<FunctionMode>,
}

impl Strategy {
    pub async fn compute(
        &self,
        conversation: &Conversation,
    ) -> Result<StrategyConfig, anyhow::Error> {
        match self {
            Strategy::UPCForcedSearch => Ok(StrategyConfig {
                max_rounds: 8,
                tasks: vec![
                    SmartActionType::SearchUPCEAN,
                    SmartActionType::ExtractLDJSON,
                    SmartActionType::SearchKagi,
                ],
                allowed_functions: match conversation.index {
                    0 => Some(vec![SearchUPCEANDatabaseTask::name()]),
                    1 => Some(vec![
                        ExtractLDJsonTask::name(),
                        SearchKagiTask::name(),
                        SearchUPCEANDatabaseTask::name(),
                    ]),
                    _ => None,
                },
                function_mode: Some(match conversation.index {
                    0 => FunctionMode::Any,
                    1 => FunctionMode::Auto,
                    _ => FunctionMode::None,
                }),
            }),
            Strategy::ProductOptimized => Ok(StrategyConfig {
                max_rounds: 8,
                tasks: vec![
                    SmartActionType::SearchKagi,
                    SmartActionType::SearchUPCEAN,
                    SmartActionType::ExtractLDJSON,
                ],
                allowed_functions: None,
                // allowed_functions: match conversation.index {
                //     // less then 5
                //     0..8 => Some(vec![
                //         SearchKagiTask::name(),
                //         ExtractLDJsonTask::name(),
                //         SearchUPCEANDatabaseTask::name(),
                //     ]),
                //     _ => None,
                // },
                function_mode: Some(match conversation.index {
                    0..3 => FunctionMode::Any,
                    3..7 => FunctionMode::Auto,
                    _ => FunctionMode::None,
                }),
                // function_mode: Some(FunctionMode::Auto),
            }),
            Strategy::Basic => Ok(StrategyConfig {
                max_rounds: 8,
                tasks: vec![
                    SmartActionType::SearchUPCEAN,
                    SmartActionType::ExtractLDJSON,
                    SmartActionType::SearchKagi,
                ],
                allowed_functions: None,
                function_mode: None,
            }),
        }
    }
}
