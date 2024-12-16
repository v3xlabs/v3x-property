use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{
    param::{Path, Query},
    payload::Json,
    Object, OpenApi,
};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

use super::{error::HttpError, ApiTags};
use crate::{
    auth::{middleware::AuthUser, permissions::Action},
    models::{
        log::LogEntry,
        product::{media::ProductMedia, Product, ProductSlim},
    },
    state::AppState,
};

pub struct ProductApi;

#[derive(Deserialize, Debug, Serialize, Object)]
pub struct ProductIdResponse {
    product_id: String,
}

#[derive(poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ProductUpdatePayload {
    pub name: Option<String>,
    pub owner_id: Option<i32>,
    pub location_id: Option<i32>,
    pub media: Option<Vec<ProductUpdateMediaPayload>>,
}

#[derive(poem_openapi::Enum, Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProductUpdateMediaStatus {
    #[serde(rename = "new-media")]
    #[oai(rename = "new-media")]
    NewMedia,
    #[serde(rename = "removed-media")]
    #[oai(rename = "removed-media")]
    RemovedMedia,
    #[serde(rename = "existing-media")]
    #[oai(rename = "existing-media")]
    ExistingMedia,
}

#[derive(poem_openapi::Object, Debug, Clone, Serialize, Deserialize)]
pub struct ProductUpdateMediaPayload {
    pub status: ProductUpdateMediaStatus,
    pub media_id: i32,
}

#[OpenApi]
impl ProductApi {
    /// /product
    ///
    /// Get all Products
    #[oai(path = "/product", method = "get", tag = "ApiTags::Product")]
    async fn get_products(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<Product>>> {
        user.check_policy("product", None, Action::Read).await?;

        Ok(Json(
            Product::get_all(&state.database)
                .await
                .map_err(HttpError::from)?,
        ))
    }

    /// /product/slim
    ///
    /// Get all Products (slim)
    #[oai(path = "/product/slim", method = "get", tag = "ApiTags::Product")]
    async fn get_products_slim(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
    ) -> Result<Json<Vec<ProductSlim>>> {
        user.check_policy("product", None, Action::Read).await?;

        Ok(Json(
            Product::get_products_slim(&state.database)
                .await
                .map_err(HttpError::from)?,
        ))
    }

    /// /product
    ///
    /// Create a Product
    #[oai(path = "/product", method = "post", tag = "ApiTags::Product")]
    async fn create_product(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        name: Query<String>,
    ) -> Result<Json<Product>> {
        user.check_policy("product", None, Action::Write).await?;

        Ok(Json(
            Product::new(&state.database, user.user_id(), name.0)
                .await
                .map_err(HttpError::from)?
                .index_search(&state.search, &state.database)
                .await
                .map_err(HttpError::from)?,
        ))
    }

    /// /product/:product_id
    ///
    /// Delete a Product by `product_id`
    #[oai(
        path = "/product/:product_id",
        method = "delete",
        tag = "ApiTags::Product"
    )]
    async fn delete_product(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        product_id: Path<i32>,
    ) -> Result<()> {
        user.check_policy("product", product_id.0.to_string().as_str(), Action::Write)
            .await?;

        let product = Product::get_by_id(&state.database, product_id.0)
            .await
            .map_err(HttpError::from)?
            .ok_or(HttpError::NotFound)?;

        product
            .delete(&state.search, &state.database)
            .await
            .map_err(HttpError::from)?;

        Ok(())
    }

    /// /product/:product_id
    ///
    /// Get a Product by `product_id`
    #[oai(
        path = "/product/:product_id",
        method = "get",
        tag = "ApiTags::Product"
    )]
    async fn get_product(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        product_id: Path<i32>,
    ) -> Result<Json<Product>> {
        user.check_policy("product", product_id.0.to_string().as_str(), Action::Read)
            .await?;

        let product = Product::get_by_id(&state.database, product_id.0)
            .await
            .map_err(HttpError::from)?
            .ok_or(HttpError::NotFound)?;

        Ok(Json(product))
    }

    /// /item/:item_id
    ///
    /// Edit a Product by `product_id`
    /// This updates the `name`, `owner_id`, `location_id`, and `media` (linking `"new-media"`, and removing `"removed-media"`)
    #[oai(
        path = "/product/:product_id",
        method = "patch",
        tag = "ApiTags::Product"
    )]
    async fn edit_product(
        &self,
        user: AuthUser,
        state: Data<&Arc<AppState>>,
        product_id: Path<i32>,
        data: Json<ProductUpdatePayload>,
    ) -> Result<()> {
        user.check_policy("product", product_id.0.to_string().as_str(), Action::Write)
            .await?;

        let product = Product::get_by_id(&state.database, product_id.0)
            .await
            .map_err(HttpError::from)?
            .ok_or(HttpError::NotFound)?;

        product
            .edit_by_id(&state.search, &state.database, &data.0)
            .await
            .map_err(HttpError::from)?;

        LogEntry::new(
            &state.database,
            "product",
            &product_id.0.to_string(),
            user.user_id().unwrap(),
            "edit",
            &serde_json::to_string(&data.0).unwrap(),
        )
        .await
        .map_err(HttpError::from)?;

        Ok(())
    }

    /// /product/:product_id/media
    ///
    /// Get all media for an Product by `product_id`
    #[oai(
        path = "/product/:product_id/media",
        method = "get",
        tag = "ApiTags::Product"
    )]
    async fn get_product_media(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        product_id: Path<i32>,
    ) -> Result<Json<Vec<i32>>> {
        user.check_policy("product", product_id.0.to_string().as_str(), Action::Read)
            .await?;

        let media = ProductMedia::get_by_product_id(&state.database, &product_id.0)
            .await
            .map_err(HttpError::from)?;

        Ok(Json(media.iter().map(|m| m.media_id).collect()))
    }

    /// /product/:product_id/logs
    ///
    /// Get all logs for an Product by `product_id`
    #[oai(
        path = "/product/:product_id/logs",
        method = "get",
        tag = "ApiTags::Product"
    )]
    async fn get_product_logs(
        &self,
        state: Data<&Arc<AppState>>,
        user: AuthUser,
        product_id: Path<i32>,
    ) -> Result<Json<Vec<LogEntry>>> {
        user.check_policy("product", product_id.0.to_string().as_str(), Action::Read)
            .await?;

        Ok(Json(
            LogEntry::find_by_resource(&state.database, "product", &product_id.0.to_string())
                .await
                .map_err(HttpError::from)?,
        ))
    }
}
