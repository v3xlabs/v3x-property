use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::modules::intelligence::{gemini::structured::{
    GeminiStructuredContentRequestPart, GeminiStructuredContentRequestPartPart,
    GeminiStructuredContentResponseCandidateContentPartFunctionResponse,
    GeminiStructuredContentResponseCandidateContentPartFunctionResponseResponse,
}, structured::{ConversationMessage, ConversationMessagePart}};

use super::{
    SmartAction, SmartActionDefinition, SmartActionParameters, SmartActionParametersProperties,
    SmartActionParametersPropertiesProperties,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchKagiTask {
    pub query: String,
}

impl SmartAction for SearchKagiTask {
    async fn execute(&self) -> Result<ConversationMessage, anyhow::Error> {
        let html = search_kagi(self.query.as_str()).await?;

        tracing::info!("html: {}", html);
        Ok(ConversationMessage {
            role: "user".to_string(),
            parts: vec![ConversationMessagePart::FunctionResponse(
                "search_kagi".to_string(),
                serde_json::Value::String(html),
            )],
        })

        // Ok(GeminiStructuredContentRequestPart {
        //     role: "user".to_string(),
        //     parts: vec![GeminiStructuredContentRequestPartPart {
        //         // text: html,
        //         text: None,
        //         function_call: None,
        //         function_response: Some(
        //             GeminiStructuredContentResponseCandidateContentPartFunctionResponse {
        //                 name: "search_kagi".to_string(),
        //                 response: GeminiStructuredContentResponseCandidateContentPartFunctionResponseResponse {
        //                     name: "search_kagi".to_string(),
        //                     content: json!({
        //                         "html": html,
        //                     }),
        //                 },
        //             },
        //         ),
        //     }],
        // })
    }

    fn as_definition() -> SmartActionDefinition {
        SmartActionDefinition {
            name: "search_kagi".to_string(),
            description: "Search Kagi (web search engine) for information".to_string(),
            parameters: SmartActionParameters {
                _type: "object".to_string(),
                properties: SmartActionParametersProperties {
                    query: SmartActionParametersPropertiesProperties {
                        _type: "string".to_string(),
                        description: "The query to search for".to_string(),
                    },
                },
            },
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KagiResponse {
    // meta: Option<KagiMeta>,
    data: KagiData,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KagiData {
    output: String,
    tokens: i32,
    references: Vec<KagiReference>,
    // references_text
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KagiReference {
    title: Option<String>,
    url: Option<String>,
    snippet: Option<String>,
    is_search_result: bool,
}

pub async fn search_kagi(query: &str) -> Result<String, anyhow::Error> {
    let kagi_api_key = std::env::var("KAGI_API_KEY").unwrap();

    // post to https://kagi.com/api/v0/fastgpt
    let client = reqwest::Client::new();
    let response = client
        .post("https://kagi.com/api/v0/fastgpt")
        .header("Authorization", format!("Bot {}", kagi_api_key))
        .json(&json!({
            "query": query,
        }))
        .send()
        .await?;
    let html: KagiResponse = response.json().await?;

    let output = html.data.output;
    let references = serde_json::to_string(&html.data.references).unwrap();

    Ok(format!("{}\nReferences:\n{}", output, references))
}

#[async_std::test]
async fn test_search_kagi() {
    dotenvy::dotenv().ok();
    let result = search_kagi("Anker 737").await;
    println!("result: {}", result.unwrap());
}
