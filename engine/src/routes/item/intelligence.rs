use std::{sync::Arc, time::Duration};

use crate::{
    models::item::Item, modules::intelligence::{
        structured::actor::{Actor, ActorEvent},
        tasks::ingress_product::IngressProductTask,
    }, state::AppState
};
use async_std::task;
use futures::{stream::BoxStream, Stream, StreamExt};
use poem::web::sse::SSE;
use poem::web::Data;
use poem_openapi::{param::Path, payload::{EventStream, Json}, types::ToJSON, Object, OpenApi};

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
    #[oai(
        path = "/item/:item_id/intelligence/suggest",
        method = "get",
        tag = "ApiTags::Items"
    )]
    async fn suggest_item_intelligence(
        &self,
        state: Data<&Arc<AppState>>,
        item_id: Path<String>,
    ) -> EventStream<BoxStream<'static, ActorEvent>> {
        let item = Item::get_by_id(&state.database, item_id.0.as_str()).await.unwrap().unwrap();

        let query = item.into_search(&state.database).await.unwrap();
        let query = query.to_json_string();

        let x = IngressProductTask {
            query,
        }
        .run(state.0)
        .await
        .unwrap();

        EventStream::new(x)
    }
}
