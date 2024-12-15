use scraper::Selector;
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::modules::intelligence::gemini::structured::{
    GeminiStructuredContentRequestPart, GeminiStructuredContentRequestPartPart,
    GeminiStructuredContentResponseCandidateContentPartFunctionResponse,
    GeminiStructuredContentResponseCandidateContentPartFunctionResponseResponse,
};

use super::{
    SmartAction, SmartActionDefinition, SmartActionParameters, SmartActionParametersProperties,
    SmartActionParametersPropertiesProperties,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExtractLDJsonTask {
    pub query: String,
}

impl SmartAction for ExtractLDJsonTask {
    async fn execute(&self) -> Result<GeminiStructuredContentRequestPart, anyhow::Error> {
        let html = extract_ldjson(self.query.as_str()).await?;

        tracing::info!("html: {}", html);

        Ok(GeminiStructuredContentRequestPart {
            role: "user".to_string(),
            parts: vec![GeminiStructuredContentRequestPartPart {
                text: None,
                function_call: None,
                function_response: Some(
                    GeminiStructuredContentResponseCandidateContentPartFunctionResponse {
                        name: "extract_ldjson".to_string(),
                        response: GeminiStructuredContentResponseCandidateContentPartFunctionResponseResponse {
                            name: "extract_ldjson".to_string(),
                            content: json!({
                                "html": html,
                            }),
                        },
                    },
                ),
            }],
        })
    }

    fn as_definition() -> SmartActionDefinition {
        SmartActionDefinition {
            name: "extract_ldjson".to_string(),
            description: "Extract LD+JSON from a url or product page".to_string(),
            parameters: SmartActionParameters {
                _type: "object".to_string(),
                properties: SmartActionParametersProperties {
                    query: SmartActionParametersPropertiesProperties {
                        _type: "string".to_string(),
                        description: "The url to extract LD+JSON from".to_string(),
                    },
                },
            },
        }
    }
}

pub async fn extract_ldjson(url: &str) -> Result<String, anyhow::Error> {
    // get the url as text and extract the ld+json
    let client = reqwest::Client::new();
    let response = client.get(url).send().await?;
    let html = response.text().await?;

    // extract the ld+json
    let ldjson = scraper::Html::parse_document(&html);
    let selector = Selector::parse("script[type='application/ld+json']").unwrap();
    let selector2 = Selector::parse("div#specs-list").unwrap();

    let output = ldjson
        .select(&selector)
        .map(|x| x.inner_html())
        .collect::<Vec<String>>();

    let output2 = ldjson
        .select(&selector2)
        .map(|x| x.inner_html())
        .collect::<Vec<String>>();

    Ok((output.join("\n") + "\n" + &output2.join("\n")).to_string())
}

#[async_std::test]
async fn test_ldjson() {
    dotenvy::dotenv().ok();
    let result = extract_ldjson("https://www.anker.com/eu-en/products/a1289").await;
    println!("result: {}", result.unwrap());
}