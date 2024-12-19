use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};

use super::{field::ItemField, Item};
use crate::{database::Database, models::tags::Tag};

#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct SearchableItem {
    pub item_id: String,
    pub name: String,
    pub product_id: Option<i32>,
    pub owner_id: Option<i32>,
    // pub location_id: Option<i32>,
    // TODO: add more location info
    pub tags: Option<Vec<SearchableItemTag>>,
    pub fields: Option<Vec<SearchableItemField>>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,

    #[serde(rename = "_vectors")]
    pub vectors: Option<SearchableItemVectors>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct SearchableItemVectors {
    pub ollama: SearchableItemVectorsOllama,
}

#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct SearchableItemVectorsOllama {
    pub regenerate: bool,
}

impl Item {
    pub async fn into_search(&self, db: &Database) -> Result<SearchableItem, sqlx::Error> {
        let fields = Some(
            ItemField::get_by_item_id(db, &self.item_id)
                .await?
                .iter()
                .map(|field| field.into())
                .collect(),
        );

        let tags = Some(
            Tag::get_by_item_id(db, &self.item_id)
                .await?
                .iter()
                .map(|tag| tag.into())
                .collect(),
        );

        tracing::info!("tags: {:?}", tags);

        Ok(SearchableItem {
            item_id: self.item_id.clone(),
            name: self.name.clone(),
            product_id: self.product_id,
            owner_id: self.owner_id,
            tags,
            fields,
            created_at: self.created_at,
            updated_at: self.updated_at,
            vectors: Some(SearchableItemVectors {
                ollama: SearchableItemVectorsOllama { regenerate: true },
            }),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct SearchableItemField {
    pub definition_id: String,
    pub value: serde_json::Value,
}

impl From<&ItemField> for SearchableItemField {
    fn from(field: &ItemField) -> Self {
        SearchableItemField {
            definition_id: field.definition_id.clone(),
            value: field.value.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct SearchableItemTag {
    pub tag_id: String,
    pub name: String,
}

impl From<&Tag> for SearchableItemTag {
    fn from(tag: &Tag) -> Self {
        SearchableItemTag {
            tag_id: tag.tag_id.to_string(),
            name: tag.name.clone(),
        }
    }
}
