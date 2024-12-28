use crate::{
    models::item::Item,
    modules::intelligence::{
        structured::actor::ActorEvent, tasks::ingress_product::IngressProductTask,
    },
    routes::error::HttpError,
    state::AppState,
};
use futures::stream::BoxStream;
use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::EventStream, types::ToYAML, Object, OpenApi};

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
        state: Data<&AppState>,
        item_id: Path<String>,
    ) -> Result<EventStream<BoxStream<'static, ActorEvent>>> {
        let item = Item::get_by_id(&state.database, item_id.0.as_str())
            .await
            .map_err(HttpError::from)?
            .ok_or(HttpError::NotFound)?;

        let query = item
            .into_search(&state.database)
            .await
            .map_err(HttpError::from)?;
        let query = query.to_yaml_string();

        IngressProductTask { query }
            .run(state.0)
            .await
            .map(EventStream::new)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }
}
