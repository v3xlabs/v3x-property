use std::sync::Arc;

use chrono::{DateTime, Utc};
use poem::{web::Data, Result};
use poem_openapi::{
    param::{Path, Query},
    payload::Json,
    Object, OpenApi,
};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use tracing::info;

use super::ApiTags;
use crate::{
    auth::{middleware::AuthUser, permissions::Action},
    models::{
        field::kind::FieldKind,
        item::{field::ItemField, Item},
        log::LogEntry, tags::Tag,
    },
    state::AppState,
};

pub mod media;

pub struct ItemsApi;

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct ItemIdResponse {
    item_id: String,
}

#[derive(poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemUpdateFieldPayload {
    pub definition_id: String,
    /// The value of the field
    /// Empty value for deleting the field
    pub value: serde_json::Value,
}

#[derive(poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemUpdatePayload {
    pub name: Option<String>,
    pub owner_id: Option<i32>,
    pub location_id: Option<i32>,
    pub product_id: Option<i32>,
    pub media: Option<Vec<ItemUpdateMediaPayload>>,
    pub fields: Option<Vec<ItemUpdateFieldPayload>>,
}

#[derive(poem_openapi::Enum, Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ItemUpdateMediaStatus {
    #[serde(rename = "new-media")]
    #[oai(rename = "new-media")]
    New,
    #[serde(rename = "removed-media")]
    #[oai(rename = "removed-media")]
    Removed,
    #[serde(rename = "existing-media")]
    #[oai(rename = "existing-media")]
    Existing,
}

#[derive(poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ItemUpdateMediaPayload {
    pub status: ItemUpdateMediaStatus,
    pub media_id: i32,
}

#[derive(poem_openapi::Object, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ItemDataField {
    pub item_id: String,
    pub definition_id: String,
    pub value: serde_json::Value,
    pub definition_name: String,
    pub definition_kind: FieldKind,
    pub definition_description: Option<String>,
    pub definition_placeholder: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[OpenApi]
impl ItemsApi {
    /// /item/owned
    ///
    /// Get all items owned by the current user
    #[oai(path = "/item/owned", method = "get", tag = "ApiTags::Items")]
    async fn get_owned_items(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<Item>>> {
        user.check_policy("item", "owned", Action::Read).await?;

        Ok(Json(
            Item::get_by_owner_id(&state.database, user.user_id().unwrap())
                .await
                .unwrap(),
        ))
    }

    /// /item
    ///
    /// Create an Item
    #[oai(path = "/item", method = "post", tag = "ApiTags::Items")]
    async fn create_item(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        item_id: Query<String>,
    ) -> Result<Json<Item>> {
        user.check_policy("item", None, Action::Write).await?;

        Ok(Json(
            Item {
                item_id: item_id.0,
                owner_id: user.user_id(),
                ..Default::default()
            }
            .insert(&state.database)
            .await
            .unwrap()
            .index_search(&state.search, &state.database)
            .await
            .unwrap(),
        ))
    }

    /// /item/next
    ///
    /// Suggest next Item Id
    #[oai(path = "/item/next", method = "get", tag = "ApiTags::Items")]
    async fn next_item_id(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<ItemIdResponse>> {
        user.check_policy("item", None, Action::Read).await?;

        info!("Getting next item id");

        Ok(Json(ItemIdResponse {
            item_id: Item::next_id(&state).await.unwrap(),
        }))
    }

    /// /item/:item_id
    ///
    /// Delete an Item by `item_id`
    #[oai(path = "/item/:item_id", method = "delete", tag = "ApiTags::Items")]
    async fn delete_item(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        item_id: Path<String>,
    ) -> Result<()> {
        user.check_policy("item", item_id.0.to_string().as_str(), Action::Delete)
            .await?;

        let item = Item::get_by_id(&state.database, &item_id.0)
            .await
            .unwrap()
            .unwrap();

        item.delete(&state.search, &state.database).await.unwrap();

        Ok(())
    }

    /// /item/:item_id
    ///
    /// Get an Item by `item_id`
    #[oai(path = "/item/:item_id", method = "get", tag = "ApiTags::Items")]
    async fn get_item(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        item_id: Path<String>,
    ) -> Result<Json<Item>> {
        user.check_policy("item", item_id.0.to_string().as_str(), Action::Read)
            .await?;

        let item = Item::get_by_id(&state.database, &item_id.0).await.unwrap();

        match item {
            Some(item) => Ok(Json(item)),
            None => Err(StatusCode::NOT_FOUND.into()),
        }
    }

    /// /item/:item_id
    ///
    /// Edit an Item by `item_id`
    /// This updates the `name`, `owner_id`, `location_id`, `product_id`, and `media` (linking `"new-media"`, and removing `"removed-media"`)
    #[oai(path = "/item/:item_id", method = "patch", tag = "ApiTags::Items")]
    async fn edit_item(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        item_id: Path<String>,
        data: Json<ItemUpdatePayload>,
    ) -> Result<()> {
        user.check_policy("item", item_id.0.to_string().as_str(), Action::Write)
            .await?;

        Item::edit_by_id(&state.search, &state.database, &data.0, &item_id.0)
            .await
            .unwrap();

        LogEntry::new(
            &state.database,
            "item",
            &item_id.0,
            user.user_id().unwrap(),
            "edit",
            &serde_json::to_string(&data.0).unwrap(),
        )
        .await
        .unwrap();

        Ok(())
    }

    /// /item/:item_id/fields
    ///
    /// Get all fields for an Item by `item_id`
    #[oai(path = "/item/:item_id/fields", method = "get", tag = "ApiTags::Items")]
    async fn get_item_fields(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        item_id: Path<String>,
    ) -> Result<Json<Vec<ItemDataField>>> {
        user.check_policy("item", item_id.0.to_string().as_str(), Action::Read)
            .await?;

        Ok(Json(
            ItemField::get_by_item_id_with_definitions(&state.database, &item_id.0)
                .await
                .unwrap(),
        ))
    }

    /// /item/:item_id/tags
    ///
    /// Get all tags for an Item by `item_id`
    #[oai(path = "/item/:item_id/tags", method = "get", tag = "ApiTags::Items")]
    async fn get_item_tags(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        item_id: Path<String>,
    ) -> Result<Json<Vec<Tag>>> {
        user.check_policy("item", item_id.0.to_string().as_str(), Action::Read)
            .await?;

        Ok(Json(Tag::get_by_item_id(&state.database, &item_id.0).await.unwrap()))
    }

    /// /item/:item_id/logs
    ///
    /// Get all logs for an Item by `item_id`
    #[oai(path = "/item/:item_id/logs", method = "get", tag = "ApiTags::Items")]
    async fn get_item_logs(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        item_id: Path<String>,
    ) -> Result<Json<Vec<LogEntry>>> {
        user.check_policy("item", item_id.0.to_string().as_str(), Action::Read)
            .await?;

        Ok(Json(
            LogEntry::find_by_resource(&state.database, "item", &item_id.0)
                .await
                .unwrap(),
        ))
    }
}
