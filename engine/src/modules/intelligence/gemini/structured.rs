use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::modules::{
    self,
    intelligence::{
        actions::{SmartActionDefinition, SmartActionType},
        structured::{
            strategy::Strategy, CalculatedResponse, Conversation, ConversationMessage,
            ConversationMessagePart,
        },
    },
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequest {
    #[serde(rename = "systemInstruction", skip_serializing_if = "Option::is_none")]
    pub system_instruction: Option<GeminiStructuredContentRequestPart>,
    pub contents: Vec<GeminiStructuredContentRequestPart>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<GeminiStructuredContentRequestTool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_config: Option<GeminiStructuredContentRequestToolConfig>,

    #[serde(rename = "generationConfig", skip_serializing_if = "Option::is_none")]
    pub generation_config: Option<GeminiStructuredContentGenerationConfig>,
}

impl GeminiStructuredContentRequest {
    pub fn from_conversation(value: &Conversation, tasks: &[SmartActionType]) -> Self {
        GeminiStructuredContentRequest {
            contents: value
                .messages
                .iter() // TODO: into_iter vs iter?
                .map(GeminiStructuredContentRequestPart::from)
                .collect(),
            system_instruction: value
                .system_instruction
                .as_ref()
                .map(|x| GeminiStructuredContentRequestPart::from(&x[0])),
            tools: if tasks.len() > 0 {
                Some(GeminiStructuredContentRequestTool {
                    function_declarations: tasks.iter().map(|x| x.as_definition()).collect(),
                })
            } else {
                None
            },
            tool_config: None,
            generation_config: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequestToolConfig {
    pub function_calling_config: GeminiStructuredContentRequestToolConfigFunctionCallingConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequestToolConfigFunctionCallingConfig {
    pub mode: String,
    pub allowed_function_names: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentGenerationConfig {
    /// application/json
    pub response_mime_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequestPart {
    pub role: String,
    pub parts: Vec<GeminiStructuredContentRequestPartPart>,
}

impl From<&ConversationMessage> for GeminiStructuredContentRequestPart {
    fn from(value: &ConversationMessage) -> Self {
        GeminiStructuredContentRequestPart {
            role: value.role.clone(),
            parts: value
                .parts
                .iter()
                .map(GeminiStructuredContentRequestPartPart::from)
                .collect(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequestPartPart {
    #[serde(rename = "functionCall", skip_serializing_if = "Option::is_none")]
    pub function_call: Option<GeminiStructuredContentResponseCandidateContentPartFunctionCall>,
    #[serde(rename = "functionResponse", skip_serializing_if = "Option::is_none")]
    pub function_response:
        Option<GeminiStructuredContentResponseCandidateContentPartFunctionResponse>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

impl From<&ConversationMessagePart> for GeminiStructuredContentRequestPartPart {
    fn from(value: &ConversationMessagePart) -> Self {
        match value {
            ConversationMessagePart::Text(text) => GeminiStructuredContentRequestPartPart {
                function_call: None,
                function_response: None,
                text: Some(text.clone()),
            },
            // TODO: Implement the rest
            _ => panic!("Unsupported message part type"),
        }
    }
}

impl From<&GeminiStructuredContentRequestPartPart> for ConversationMessagePart {
    fn from(value: &GeminiStructuredContentRequestPartPart) -> Self {
        if let Some(text) = value.text.clone() {
            ConversationMessagePart::Text(text)
        } else if let Some(function_call) = value.function_call.clone() {
            ConversationMessagePart::FunctionCall(function_call.name, Value::String(function_call.args.query))
        } else if let Some(function_response) = value.function_response.clone() {
            ConversationMessagePart::FunctionResponse(function_response.name, function_response.response.content)
        } else {
            panic!("Unsupported GeminiStructuredContentRequestPartPart type");
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentResponseCandidateContentPartFunctionResponse {
    pub name: String,
    pub response: GeminiStructuredContentResponseCandidateContentPartFunctionResponseResponse,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentResponseCandidateContentPartFunctionResponseResponse {
    pub name: String,
    pub content: Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequestTool {
    pub function_declarations: Vec<SmartActionDefinition>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequestFunctionDeclaration {
    pub name: String,
    pub description: String,
    pub parameters: GeminiStructuredContentRequestFunctionDeclarationParameters,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequestFunctionDeclarationParameters {
    #[serde(rename = "type")]
    pub _type: String,
    pub properties: GeminiStructuredContentRequestFunctionDeclarationParametersProperties,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequestFunctionDeclarationParametersProperties {
    pub upc: GeminiStructuredContentRequestFunctionDeclarationParametersPropertiesRgbHex,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentRequestFunctionDeclarationParametersPropertiesRgbHex {
    #[serde(rename = "type")]
    pub _type: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentResponse {
    pub candidates: Option<Vec<GeminiStructuredContentResponseCandidate>>,
}

impl From<GeminiStructuredContentResponse> for CalculatedResponse {
    fn from(value: GeminiStructuredContentResponse) -> Self {
        CalculatedResponse {
            candidates: value.candidates.map(|candidates| {
                candidates
                    .into_iter()
                    .map(ConversationMessage::from)
                    .collect()
            }),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentResponseCandidate {
    pub content: GeminiStructuredContentRequestPart,
}

impl From<GeminiStructuredContentResponseCandidate> for ConversationMessage {
    fn from(value: GeminiStructuredContentResponseCandidate) -> Self {
        ConversationMessage {
            role: value.content.role,
            parts: value
                .content
                .parts
                .into_iter()
                .map(|p| ConversationMessagePart::from(&p))
                .collect(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentResponseCandidateContentPartFunctionCall {
    pub name: String,
    pub args: GeminiStructuredContentResponseCandidateContentPartFunctionCallArgs,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeminiStructuredContentResponseCandidateContentPartFunctionCallArgs {
    pub query: String,
}

// impl Gemini {
//     pub async fn structured_content<T: DeserializeOwned>(
//         &self,
//         query: &GeminiStructuredContentRequest,
//     ) -> Result<T, anyhow::Error> {
//         let client = reqwest::Client::new();

//         let response = client
//         .post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent")
//         .query(&[("key", &self.api_key)])
//         .json(query)
//         .send()
//         .await?;

//         // let x = response.text().await?;
//         let x: T = response.json().await.unwrap();

//         Ok(x)
//     }
// }

#[async_std::test]
async fn test_gemini_structured_content() {
    let conversation = Conversation {
        index: 0,
        strategy: Strategy::Basic,
        system_instruction: None,
        messages: vec![ConversationMessage {
            role: "user".to_string(),
            parts: vec![ConversationMessagePart::Text("Hello there".to_string())],
        }],
    };

    let body = GeminiStructuredContentRequest::from(&conversation);

    // output the serde_json to string of conversation
    let x = serde_json::to_string(&body).unwrap();
    println!("{}", x);
}