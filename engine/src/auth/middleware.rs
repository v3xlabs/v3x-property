use std::sync::Arc;

use poem::{web::Data, Error, FromRequest, Request, RequestBody, Result};
use poem_openapi::{
    registry::{MetaSecurityScheme, Registry},
    ApiExtractor, ApiExtractorType, ExtractParamOptions,
};
use reqwest::StatusCode;

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

impl<'a> ApiExtractor<'a> for AuthToken {
    const TYPES: &'static [ApiExtractorType] = &[ApiExtractorType::SecurityScheme];

    type ParamType = ();

    type ParamRawType = ();

    async fn from_request(
        req: &'a Request,
        body: &mut RequestBody,
        _param_opts: ExtractParamOptions<Self::ParamType>,
    ) -> Result<Self> {
        let state = <Data<&Arc<AppState>> as FromRequest>::from_request(req, body).await?;

        // extract cookies from request
        let _cookies = req.headers().get("Cookie").and_then(|x| x.to_str().ok());

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

    fn register(registry: &mut Registry) {
        registry.create_security_scheme(
            "AuthToken",
            MetaSecurityScheme {
                ty: "http",
                description: Some("Session token for authentication"),
                name: None,
                key_in: None,
                scheme: Some("bearer"),
                bearer_format: Some("Bearer"),
                flows: None,
                openid_connect_url: None,
            },
        );
    }
    fn security_schemes() -> Vec<&'static str> {
        vec!["AuthToken"]
    }
}
