use serde::{Deserialize, Serialize};

use crate::modules::intelligence::structured::{ConversationMessage, ConversationMessagePart};

use super::{
    SmartAction, SmartActionDefinition, SmartActionParameters, SmartActionParametersProperties,
    SmartActionParametersPropertiesProperties,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchUPCEANDatabaseTask {
    pub upc: String,
}

impl SmartAction for SearchUPCEANDatabaseTask {
    async fn execute(&self) -> Result<ConversationMessage, anyhow::Error> {
        let upc = self
            .upc
            .strip_prefix("\"")
            .unwrap()
            .strip_suffix("\"")
            .unwrap();

        if !upc.chars().all(|c| c.is_digit(10)) || upc.len() > 20 {
            return Err(anyhow::anyhow!("Barcode is not valid"));
        }

        let html = search_upcitemdb(upc).await?;

        tracing::info!("html: {} {}", upc, html);

        Ok(ConversationMessage {
            role: "user".to_string(),
            parts: vec![ConversationMessagePart::FunctionResponse(
                "search_upcitemdb".to_string(),
                serde_json::Value::String(html),
            )],
        })
    }

    fn as_definition() -> SmartActionDefinition {
        SmartActionDefinition {
            name: "search_upc_database".to_string(),
            description: "Search UPC Database by UPC".to_string(),
            parameters: SmartActionParameters {
                _type: "object".to_string(),
                properties: SmartActionParametersProperties {
                    query: SmartActionParametersPropertiesProperties {
                        _type: "string".to_string(),
                        description: "The UPC to lookup".to_string(),
                    },
                },
            },
        }
    }

    fn name() -> String {
        "search_upc_database".to_string()
    }
}

pub async fn search_upcitemdb(upc: &str) -> Result<String, anyhow::Error> {
    // query https://www.upcitemdb.com/upc/4945247421354
    let response = reqwest::get(format!("https://www.upcitemdb.com/upc/{}", upc)).await?;
    let html = response.text().await?;
    let document = scraper::Html::parse_document(&html);
    let selector = scraper::Selector::parse(".upcdetail").unwrap();
    let selector2 = scraper::Selector::parse(".tabcon-details").unwrap();

    let elements = document.select(&selector).collect::<Vec<_>>();
    let elements2 = document.select(&selector2).collect::<Vec<_>>();

    let mut result = String::new();
    for element in elements {
        result.push_str(&element.html());
    }

    for element in elements2 {
        result.push_str(&element.html());
    }

    Ok(result)
}

#[async_std::test]
async fn test_search_barcodelookup() {
    let result = search_upcitemdb("4945247421354").await;
    println!("result: {}", result.unwrap());
}
