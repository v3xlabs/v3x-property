use std::sync::Arc;

use hmac::{Hmac, Mac};
use poem::{web::Data, Error, FromRequest, Request, RequestBody, Result};
use reqwest::StatusCode;
use sha2::Sha256;

use crate::state::AppState;

use super::session::SessionState;

pub struct ActiveUser {
    pub session: SessionState,
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
                let mut hash = Hmac::<Sha256>::new_from_slice(b"").unwrap();
                hash.update(token.as_bytes());
                let hash = hex::encode(hash.finalize().into_bytes());

                // Check if active session exists with token
                let session = SessionState::try_access(&hash, &state.database)
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
