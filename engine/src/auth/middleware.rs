use std::sync::Arc;

use poem::{web::Data, Error, FromRequest, Request, RequestBody, Result};
use reqwest::StatusCode;
use uuid::Uuid;

use crate::state::AppState;

use super::session::SessionState;

pub struct ActiveUser {
    pub session: SessionState,
}

pub enum AuthToken {
    Active(ActiveUser),
    Error(Error),
    None,
}

impl<'a> FromRequest<'a> for AuthToken {
    async fn from_request(req: &'a Request, body: &mut RequestBody) -> Result<Self> {
        let state = Data::<&Arc<AppState>>::from_request(req, body).await?;

        // Extract token from header
        let token = req
            .headers()
            .get("Authorization")
            .and_then(|x| x.to_str().ok())
            .and_then(|x| Uuid::parse_str(&x.replace("Bearer ", "")).ok());

        match token {
            Some(token) => {
                // Check if active session exists with token
                let session = SessionState::get_by_id(token, &state.database)
                    .await
                    .unwrap();

                Ok(AuthToken::Active(ActiveUser { session }))
            }
            None => Ok(AuthToken::None),
        }
    }
}
