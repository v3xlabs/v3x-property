use std::sync::Arc;

use poem::{web::Data, Error, FromRequest, Request, RequestBody, Result};
use reqwest::StatusCode;
use tracing::info;

use super::hash::hash_session;
use crate::{models::sessions::Session, state::AppState};

pub struct ActiveUser {
    pub session: Session,
}

pub enum AuthToken {
    Active(ActiveUser),
    None,
}

impl AuthToken {
    pub fn ok(&self) -> Option<&ActiveUser> {
        match self {
            AuthToken::Active(user) => Some(user),
            AuthToken::None => None,
        }
    }
}

impl<'a> FromRequest<'a> for AuthToken {
    async fn from_request(req: &'a Request, body: &mut RequestBody) -> Result<Self> {
        let state = Data::<&Arc<AppState>>::from_request(req, body).await?;

        // extract cookies from request
        let cookies = req.headers().get("Cookie").and_then(|x| x.to_str().ok());

        info!("Cookies: {:?}", cookies);

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
                let session = Session::try_access(&state.database, &hash)
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
