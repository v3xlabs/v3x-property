use std::{fs::File, ops::Deref, sync::Arc};
use tracing::{debug, info};
use serde_json::{json, Value};

use crate::{
    modules::intelligence::{
        actions::{
            kagi::SearchKagiTask, ldjson::ExtractLDJsonTask, upcitemdb::SearchUPCEANDatabaseTask,
            SmartAction,
        },
        gemini::structured::{
            GeminiStructuredContentGenerationConfig, GeminiStructuredContentRequestTool,
            GeminiStructuredContentRequestToolConfig,
            GeminiStructuredContentRequestToolConfigFunctionCallingConfig,
            GeminiStructuredContentResponse,
            GeminiStructuredContentResponseCandidateContentPartFunctionResponse,
            GeminiStructuredContentResponseCandidateContentPartFunctionResponseResponse,
        },
        structured::{actor::Actor, CalculatedResponse, Conversation, ConversationMessage},
        Intelligence,
    },
    state::AppState,
};

use super::structured::{
    GeminiStructuredContentRequest, GeminiStructuredContentRequestPart,
    GeminiStructuredContentRequestPartPart,
};

pub struct GeminiActor {
    system: Option<GeminiStructuredContentRequestPart>,
    contents: Vec<GeminiStructuredContentRequestPart>,
}

impl GeminiActor {
    pub async fn init(
        state: &Arc<AppState>,
        system: Option<GeminiStructuredContentRequestPart>,
        contents: Vec<GeminiStructuredContentRequestPart>,
    ) -> Result<Self, anyhow::Error> {
        Ok(Self { system, contents })
    }

    // pub async fn prompt(
    //     &mut self,
    //     state: &Arc<AppState>,
    // ) -> Result<GeminiStructuredContentRequestPartPart, anyhow::Error> {
    //     let client = reqwest::Client::new();

    //     let mut queries = 0;

    //     loop {
    //         let query = GeminiStructuredContentRequest {
    //             system_instruction: self.system.clone(),
    //             contents: self.contents.clone(),
    //             tools: Some(GeminiStructuredContentRequestTool {
    //                 function_declarations: vec![
    //                     SearchKagiTask::as_definition(),
    //                     ExtractLDJsonTask::as_definition(),
    //                     SearchUPCEANDatabaseTask::as_definition(),
    //                 ],
    //             }),
    //             tool_config: Some(GeminiStructuredContentRequestToolConfig {
    //                 function_calling_config:
    //                     GeminiStructuredContentRequestToolConfigFunctionCallingConfig {
    //                         mode: match queries {
    //                             0 => "ANY".to_string(),
    //                             1 => "ANY".to_string(),
    //                             2 => "ANY".to_string(),
    //                             3 => "ANY".to_string(),
    //                             4 => "ANY".to_string(),
    //                             5 => "ANY".to_string(),
    //                             x if x < 8 => "AUTO".to_string(),
    //                             // from 8 onwards we only allow none
    //                             _ => "NONE".to_string(),
    //                         },
    //                         allowed_function_names: match queries {
    //                             0 => Some(vec!["search_upc_database".to_string()]),
    //                             1 => Some(vec![
    //                                 "search_kagi".to_string(),
    //                                 "extract_ldjson".to_string(),
    //                             ]),
    //                             2 => Some(vec!["extract_ldjson".to_string()]),
    //                             3 => Some(vec!["search_kagi".to_string()]),
    //                             4 => Some(vec!["extract_ldjson".to_string()]),
    //                             5 => Some(vec!["extract_ldjson".to_string()]),
    //                             _ => None,
    //                         },
    //                     },
    //             }),
    //             generation_config: None,
    //             // generation_config: Some(GeminiStructuredContentGenerationConfig {
    //             // response_mime_type: "application/json".to_string(),
    //             // }),
    //         };

    //         tracing::info!("Current Contents: {:?}", self.contents);

    //         let response = client
    //             .post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent")
    //             .query(&[("key", &state.intelligence.as_ref().unwrap().gemini.as_ref().unwrap().api_key)])
    //             .json(&query)
    //             .send()
    //             .await?;

    //         let x1 = response.json::<Value>().await.unwrap();

    //         let x: GeminiStructuredContentResponse = serde_json::from_value(x1.clone()).unwrap();

    //         if x.candidates.is_none() {
    //             tracing::error!("No candidates found");

    //             tracing::info!("response: {:?}", x1);

    //             return Err(anyhow::anyhow!("No candidates found"));
    //         }

    //         let xs = x.candidates.as_ref().unwrap();

    //         tracing::info!("size: {}", xs.len());

    //         // for x in xs

    //         let should = x
    //             .candidates
    //             .as_ref()
    //             .unwrap()
    //             .first()
    //             .unwrap()
    //             .content
    //             .parts
    //             .first()
    //             .unwrap();

    //         queries += 1;

    //         if let Some(call) = &should.function_call {
    //             self.contents.push(GeminiStructuredContentRequestPart {
    //                 role: "model".to_string(),
    //                 parts: vec![should.clone()],
    //             });

    //             match call.name.as_str() {
    //                 "search_upc_database" => {
    //                     let upc_task: SearchUPCEANDatabaseTask = SearchUPCEANDatabaseTask {
    //                         upc: call.args.query.clone(),
    //                     };
    //                     tracing::info!("response: {:?}", upc_task);

    //                     let response = upc_task.execute().await?;

    //                     self.contents.push(response);
    //                 }
    //                 "search_kagi" => {
    //                     let kagi_task: SearchKagiTask = SearchKagiTask {
    //                         query: call.args.query.clone(),
    //                     };
    //                     tracing::info!("response: {:?}", kagi_task);

    //                     let response = kagi_task.execute().await?;

    //                     self.contents.push(response);
    //                 }
    //                 "extract_ldjson" => {
    //                     let ldjson_task: ExtractLDJsonTask = ExtractLDJsonTask {
    //                         query: call.args.query.clone(),
    //                     };
    //                     tracing::info!("response: {:?}", ldjson_task);

    //                     let response = ldjson_task.execute().await.ok().unwrap_or(
    //                         GeminiStructuredContentRequestPart {
    //                             role: "user".to_string(),
    //                             parts: vec![GeminiStructuredContentRequestPartPart {
    //                                 // text: Some("{}".to_string()),
    //                                 text: None,
    //                                 function_call: None,
    //                                 function_response: Some(GeminiStructuredContentResponseCandidateContentPartFunctionResponse {
    //                                     name: "extract_ldjson".to_string(),
    //                                     response: GeminiStructuredContentResponseCandidateContentPartFunctionResponseResponse {
    //                                         name: "extract_ldjson".to_string(),
    //                                         content: json!({}),
    //                                     },
    //                                 }),
    //                             }],
    //                         },
    //                     );

    //                     self.contents.push(response);
    //                 }
    //                 _ => {
    //                     tracing::error!("Unknown function call: {}", call.name);
    //                 }
    //             }
    //         } else {
    //             tracing::info!("response: {:?}", should);

    //             // remove ```json and ``` from start and end
    //             let text = should.text.as_ref().unwrap();
    //             let text = text.replace("```json", "").replace("```", "");

    //             // attempt a serde parse
    //             let json: Value = serde_json::from_str(&text).unwrap();
    //             // write to file
    //             let mut file = File::create("json.json").unwrap();
    //             serde_json::to_writer_pretty(&mut file, &json).unwrap();

    //             tracing::info!("json: {:?}", json);

    //             return Ok(should.clone());
    //         }
    //     }
    // }
}

impl Actor for GeminiActor {
    async fn calculate(
        &self,
        intelligence: &Intelligence,
        conversation: &Conversation,
    ) -> Result<CalculatedResponse, anyhow::Error> {
        // let gemini_body = GeminiStructuredContentRequest {
        //     contents: conversation.messages.into(),
        //     system_instruction: match &conversation.system_instruction {
        //         Some(x) => Some(
        //             x.into_iter()
        //                 .map(GeminiStructuredContentRequestPart::from)
        //                 .collect(),
        //         ),
        //         None => None,
        //     },
        //     tool_config: None,
        //     generation_config: None,
        //     tools: None,
        // };

        let body: GeminiStructuredContentRequest = conversation.into();

        let client = reqwest::Client::new();
        let api_key = intelligence.gemini.as_ref().unwrap().api_key.as_str();

        let response = client.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent")
        .query(&[("key", api_key)])
        .json(&body)
        .send()
        .await?;

        let raw_response: Value = response.json().await?;

        let response: GeminiStructuredContentResponse = serde_json::from_value(raw_response.clone()).unwrap();
 
        info!("response: {:?}", response);
 
        info!("raw_response: {:?}", raw_response);

        info!("body: {:?}", body);
        let output: CalculatedResponse = response.into();

        Ok(output)
    }
}
