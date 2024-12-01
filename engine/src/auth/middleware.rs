use std::sync::Arc;

use poem::{web::Data, Error, FromRequest, Request, RequestBody, Result};
use reqwest::StatusCode;

use crate::{models::sessions::Session, state::AppState};

use super::hash::hash_session;

pub struct ActiveUser {
    pub session: Session,
}

pub enum AuthToken {
    Active(ActiveUser),
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
            .map(|x| x.replace("Bearer ", ""));

        match token {
            Some(token) => {
                // Hash the token
                let hash = hash_session(&token).unwrap();

                // Check if active session exists with token
                let session = Session::try_access(&hash, &state.database)
                    .await
                    .unwrap()
                    .ok_or(Error::from_string(
                        "Session not found, token valid but no session exists",
                        StatusCode::UNAUTHORIZED,
                    ))?;

                Ok(AuthToken::Active(ActiveUser { session }))
            }
            None => Ok(AuthToken::None),
        }
    }
}
