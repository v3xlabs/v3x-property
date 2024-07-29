use std::sync::Arc;

use poem::{
    http::StatusCode,
    web::{cookie::CookieJar, Data},
    Error, FromRequest, Request, RequestBody, Result, Route,
};
use uuid::Uuid;

use crate::state::AppState;

use super::session::SessionState;

pub struct AuthToken {
    pub session: SessionState,
}

impl<'a> FromRequest<'a> for AuthToken {
    async fn from_request(req: &'a Request, body: &mut RequestBody) -> Result<Self> {
        let state = Data::<&Arc<AppState>>::from_request(req, body).await?;

        let token = {
            let token = req
                .headers()
                .get("Authorization")
                .map(|x| x.to_str().unwrap().replace("Bearer ", ""))
                .expect("No token found");
            Uuid::parse_str(&token).unwrap()
        };

        let session = SessionState::get_by_id(token, &state.database)
            .await
            .unwrap();

        Ok(AuthToken { session })
    }
}
