use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::{field::ItemField, Item};
use crate::database::Database;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchableItem {
    pub item_id: String,
    pub name: String,
    pub product_id: Option<i32>,
    pub owner_id: Option<i32>,
    pub location_id: Option<i32>,
    // TODO: add more location info
    pub fields: Vec<SearchableItemField>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Item {
    pub async fn into_search(&self, db: &Database) -> Result<SearchableItem, sqlx::Error> {
        let fields = ItemField::get_by_item_id(db, &self.item_id)
            .await?
            .iter()
            .map(|field| field.into())
            .collect();

        Ok(SearchableItem {
            item_id: self.item_id.clone(),
            name: self.name.clone(),
            product_id: self.product_id,
            owner_id: self.owner_id,
            location_id: self.location_id,
            fields,
            created_at: self.created_at,
            updated_at: self.updated_at,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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