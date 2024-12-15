use std::{thread::sleep, time::Duration};

use headless_chrome::{browser::tab::point::Point, types::Bounds, Browser};
use kagi::SearchKagiTask;
use ldjson::ExtractLDJsonTask;
use rand::Rng as _;
use serde::{Deserialize, Serialize};
use upcitemdb::SearchUPCEANDatabaseTask;

use super::gemini::structured::{
    GeminiStructuredContentRequestPart, GeminiStructuredContentRequestPartPart,
};

pub enum SmartActionType {
    SearchUPCEAN,
    SearchKagi,
    ExtractLDJSON,
}

impl SmartActionType {
    pub fn as_definition(&self) -> SmartActionDefinition {
        match self {
            SmartActionType::SearchUPCEAN => SearchUPCEANDatabaseTask::as_definition(),
            SmartActionType::SearchKagi => SearchKagiTask::as_definition(),
            SmartActionType::ExtractLDJSON => ExtractLDJsonTask::as_definition(),
        }
    }
}

pub trait SmartAction: Sized {
    async fn execute(&self) -> Result<GeminiStructuredContentRequestPart, anyhow::Error>;
    fn as_definition() -> SmartActionDefinition;
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SmartActionDefinition {
    pub name: String,
    pub description: String,
    pub parameters: SmartActionParameters,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SmartActionParameters {
    #[serde(rename = "type")]
    pub _type: String,
    pub properties: SmartActionParametersProperties,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SmartActionParametersProperties {
    pub query: SmartActionParametersPropertiesProperties,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SmartActionParametersPropertiesProperties {
    #[serde(rename = "type")]
    pub _type: String,
    pub description: String,
}

pub mod upcitemdb;
pub mod kagi;
pub mod ldjson;


// pub async fn search_ean_database(ean: &str) -> Result<String, anyhow::Error> {
//     // This endpoint redirects to either a product page (some random url) or to https://www.ean-search.org/sorry.html
//     // We need to follow the redirect and get the product page
//     // If it redirects to sorry.html, we need to return an error

//     let client = reqwest::Client::new();
//     let response = client
//         .get(format!("https://ean-search.org/ean/{}", ean))
//         .send()
//         .await?;

//     // Check if the final URL is the sorry.html page
//     if response.url().as_str().contains("sorry.html") {
//         return Err(anyhow::anyhow!("EAN not found"));
//     }

//     let html = response.text().await?;

//     // If response includes "You have been blocked."
//     if html.contains("You have been blocked.") {
//         return Err(anyhow::anyhow!("EAN blocked"));
//     }

//     Ok(html)
// }

// pub async fn search_barcodelookup(query: &str) -> Result<String, anyhow::Error> {
//     // query https://www.barcodelookup.com/4945247421354
//     let browser = Browser::default().unwrap();
//     let context = browser.new_context().unwrap();

//     let tab = context.new_tab().unwrap();
//     tab.set_bounds(Bounds::Fullscreen).unwrap();
//     tab.enable_stealth_mode().unwrap();
//     tab.set_user_agent(
//         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//         Some("en-US"),
//         Some("Mac"),
//     )
//     .unwrap();
//     let headers = [
//         ("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
//         ("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"),
//         ("Accept-Language", "en-US,en;q=0.9"),
//         ("Accept-Encoding", "gzip, deflate, br"),
//         ("Connection", "keep-alive"),
//         ("Upgrade-Insecure-Requests", "1"),
//     ];
//     tab.set_extra_http_headers(headers.into_iter().collect())
//         .unwrap();

//     tab.navigate_to(&format!("https://www.barcodelookup.com/{}", query))
//         .unwrap();

//     sleep(Duration::from_millis(20));

//     let offset = 209.2 + rand::thread_rng().gen_range(0..10) as f64;
//     let offset2 = 20.12 + rand::thread_rng().gen_range(0..10) as f64;

//     tab.click_point(Point {
//         x: offset,
//         y: offset2,
//     })
//     .unwrap();

//     sleep(Duration::from_millis(41));

//     sleep(Duration::from_millis(40));

//     // wait for 5 seconds
//     for _ in 0..5 {
//         let htmlz = tab
//             .wait_for_element_with_custom_timeout(".product-details", Duration::from_secs(1))
//             .ok();

//         if htmlz.is_some() {
//             println!("FOUND!!!!!");
//             break;
//         }

//         let htmlz = tab
//             .wait_for_element_with_custom_timeout(".search-input", Duration::from_secs(1))
//             .ok();

//         if let Some(element) = htmlz {
//             tracing::info!("FOUND SEARCH PAGE!");
//             element.focus().unwrap();
//             tab.type_str(query).unwrap();
//             tab.find_element(".btn-search").unwrap().click().unwrap();
//             break;
//         }

//         let html = tab.get_content().unwrap();
//         tracing::info!("html: {}", html);
//         println!("html: {}", html);
//         println!("waiting...");
//         sleep(Duration::from_millis(100));
//     }

//     let html = tab.find_element("html").unwrap().value;
//     println!("html: {}", html);

//     // input.search-input "4945247421354"
//     // let element = tab.find_element(".search-input").unwrap();
//     // element.focus().unwrap();
//     // tab.type_str("4945247421354").unwrap();

//     // // click .btn-search
//     // let element = tab.find_element(".btn-search").unwrap();
//     // element.click().unwrap();

//     // sleep(Duration::from_millis(401));

//     // filter out #largeProductImage and .product-details, use scraper
//     let document = scraper::Html::parse_document(&html);
//     let selector = scraper::Selector::parse("#largeProductImage").unwrap();
//     let selector2 = scraper::Selector::parse(".product-details").unwrap();
//     let elements = document.select(&selector).collect::<Vec<_>>();
//     let elements2 = document.select(&selector2).collect::<Vec<_>>();
//     let mut result = String::new();
//     for element in elements {
//         result.push_str(&element.text().collect::<String>());
//     }

//     for element in elements2 {
//         result.push_str(&element.text().collect::<String>());
//     }

//     Ok(result)
// }
