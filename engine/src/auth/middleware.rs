use std::sync::Arc;

use poem::{web::Data, Error, FromRequest, Request, RequestBody, Result};
use poem_openapi::{
    registry::{MetaSecurityScheme, Registry},
    ApiExtractor, ApiExtractorType, ExtractParamOptions,
};
use reqwest::StatusCode;

use super::{hash::hash_session, permissions::Actions};
use crate::{
    models::{sessions::Session, user::user::User},
    state::AppState,
};

#[derive(Clone)]
pub struct ActiveUser {
    pub session: Session,
}

#[derive(Clone)]
pub enum AuthToken {
    Active(ActiveUser, Arc<AppState>),
    None(Arc<AppState>),
}

impl AuthToken {
    pub fn ok(&self) -> Option<&ActiveUser> {
        match self {
            AuthToken::Active(user, _) => Some(user),
            AuthToken::None(_) => None,
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

        let state = state.0;

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

                Ok(AuthToken::Active(ActiveUser { session }, state.clone()))
            }
            None => Ok(AuthToken::None(state.clone())),
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

impl AuthToken {
    fn state(&self) -> &Arc<AppState> {
        match self {
            AuthToken::Active(_, state) => state,
            AuthToken::None(state) => state,
        }
    }

    pub async fn check_policy(
        &self,
        resource_type: &str,
        resource_id: impl Into<Option<&str>>,
        actions: impl Into<Actions>,
    ) -> Result<(), Error> {
        let db = &self.state().database;
        let user = self.ok().map(|x| x.session.user_id);
        let resource_id: Option<&str> = resource_id.into();

        User::has_permissions(db, user, resource_type, resource_id, actions.into())
            .await
            .ok_or(Error::from_status(StatusCode::FORBIDDEN))
            .map(|_| ())
    }
}
