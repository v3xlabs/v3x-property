use std::time::Duration;

use async_std::task;
use futures::{stream::BoxStream, StreamExt};
use poem::web::sse::SSE;
use poem_openapi::{param::Path, payload::EventStream, Object, OpenApi};
use super::ApiTags;

#[derive(Object)]
pub struct Event {
    pub event: String,
}

pub struct ItemIntelligenceApi;

#[OpenApi]
impl ItemIntelligenceApi {
    
    /// /item/:item_id/intelligence
    /// 
    /// Leverage intelligence to complete your item and product data
    #[oai(path = "/item/:item_id/intelligence/suggest", method = "get", tag = "ApiTags::Items")]
    async fn suggest_item_intelligence(&self, item_id: Path<String>) -> EventStream<BoxStream<'static, Event>> {
        EventStream::new(
            async_stream::stream! {
                yield Event {
                    event: "test".to_string(),
                };

                for i in 0..10 {
                    yield Event {
                        event: format!("test {}", i),
                    };
                    task::sleep(Duration::from_secs(1)).await;
                }
            }.boxed()
        )
    }
}