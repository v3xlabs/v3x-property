use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use tracing::info;

use crate::{
    auth::{middleware::AuthUser, permissions::Action},
    models::location::{ItemLocation, Location},
    state::AppState,
};

use super::error::HttpError;
use crate::routes::ApiTags;

pub struct LocationApi;

#[OpenApi]
impl LocationApi {
    #[oai(path = "/location", method = "get", tag = "ApiTags::Location")]
    async fn get_all(&self, user: AuthUser, state: Data<&AppState>) -> Result<Json<Vec<Location>>> {
        user.check_policy("location", "", Action::Read).await?;

        Location::get_all(&state.database)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    /// /location
    ///
    /// Create a new location
    ///
    /// created_at and updated_at are automatically set and do not need to be provided
    #[oai(path = "/location", method = "post", tag = "ApiTags::Location")]
    async fn create(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        payload: Json<Location>,
    ) -> Result<Json<Location>> {
        user.check_policy("location", "", Action::Write).await?;

        Location::new(
            &state.database,
            payload.0.location_id,
            payload.0.name,
            payload.0.root_location_id,
        )
        .await
        .map(Json)
        .map_err(HttpError::from)
        .map_err(poem::Error::from)
    }

    #[oai(
        path = "/location/:location_id",
        method = "get",
        tag = "ApiTags::Location"
    )]
    async fn get(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        location_id: Path<String>,
    ) -> Result<Json<Location>> {
        user.check_policy("location", location_id.0.as_str(), Action::Read)
            .await?;

        Location::get_by_id(&state.database, &location_id.0)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    /// /location/:location_id
    ///
    /// Update a location
    /// At the moment only the name can be updated, media soonTM
    #[oai(
        path = "/location/:location_id",
        method = "put",
        tag = "ApiTags::Location"
    )]
    async fn update(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        location_id: Path<String>,
        payload: Json<Location>,
    ) -> Result<Json<Location>> {
        user.check_policy("location", location_id.0.as_str(), Action::Write)
            .await?;

        Location::update(&state.database, &location_id.0, &payload.0.name)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    /// /location/:location_id/items
    ///
    /// Get all items in a location
    #[oai(
        path = "/location/:location_id/items",
        method = "get",
        tag = "ApiTags::Location"
    )]
    async fn get_items(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        location_id: Path<String>,
    ) -> Result<Json<Vec<ItemLocation>>> {
        user.check_policy("location", location_id.0.as_str(), Action::Read)
            .await?;

        Location::get_items_by_location_id(&state.database, &location_id.0)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }

    /// /location/:location_id/locations
    ///
    /// Get all child locations of a location
    #[oai(
        path = "/location/:location_id/locations",
        method = "get",
        tag = "ApiTags::Location"
    )]
    async fn get_locations(
        &self,
        user: AuthUser,
        state: Data<&AppState>,
        location_id: Path<String>,
    ) -> Result<Json<Vec<Location>>> {
        user.check_policy("location", location_id.0.as_str(), Action::Read)
            .await?;

        let location_id = location_id.0.to_string();
        let location_id = if location_id == "_" {
            None
        } else {
            Some(location_id)
        };

        info!("Getting locations for {:?}", location_id);

        Location::get_by_root_location_id(&state.database, location_id)
            .await
            .map(Json)
            .map_err(HttpError::from)
            .map_err(poem::Error::from)
    }
}
