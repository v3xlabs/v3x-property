use poem::{web::Data, Error, FromRequest, Request, RequestBody, Result};
use poem_openapi::{
    registry::{MetaSecurityScheme, Registry},
    ApiExtractor, ApiExtractorType, ExtractParamOptions,
};
use reqwest::StatusCode;

use super::{hash::hash_session, permissions::Actions};
use crate::{
    models::{keys::UserApiKey, sessions::Session, user::user::User},
    state::AppState,
};

#[derive(Clone)]
pub struct PatStorage {
    pub user_id: i32,
}

#[derive(Clone)]
pub enum AuthUser {
    User(Session, AppState),
    Pat(UserApiKey, AppState),
    None(AppState),
}

// impl AuthUser {
//     pub fn ok(&self) -> Option<&ActiveUser> {
//         match self {
//             AuthUser::Active(user, _) => Some(user),
//             AuthUser::None(_) => None,
//         }
//     }
// }
impl AuthUser {
    pub fn user_id(&self) -> Option<i32> {
        match self {
            AuthUser::User(session, _) => Some(session.user_id),
            AuthUser::Pat(pat, _) => Some(pat.user_id),
            AuthUser::None(_) => None,
        }
    }
}

impl<'a> ApiExtractor<'a> for AuthUser {
    const TYPES: &'static [ApiExtractorType] = &[ApiExtractorType::SecurityScheme];

    type ParamType = ();

    type ParamRawType = ();

    async fn from_request(
        req: &'a Request,
        body: &mut RequestBody,
        _param_opts: ExtractParamOptions<Self::ParamType>,
    ) -> Result<Self> {
        let state = <Data<&AppState> as FromRequest>::from_request(req, body).await?;

        let state = state.0;

        // extract cookies from request
        let _cookies = req.headers().get("Cookie").and_then(|x| x.to_str().ok());

        // Extract token from header
        let token = req
            .headers()
            .get("Authorization")
            .and_then(|x| x.to_str().ok())
            .map(|x| x.replace("Bearer ", ""));

        // Token could either be a session token or a pat token
        if token.is_none() {
            return Ok(AuthUser::None(state.clone()));
        }

        let token = token.unwrap();

        let is_user = async {
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

            Ok(AuthUser::User(session, state.clone())) as Result<AuthUser>
        };

        let is_pat = async {
            let pat = UserApiKey::find_by_token(&state.database, &token)
                .await
                .unwrap();

            if pat.is_none() {
                return Ok(AuthUser::None(state.clone())) as Result<AuthUser>;
            }

            Ok(AuthUser::Pat(pat.unwrap(), state.clone())) as Result<AuthUser>
        };

        let (user, pat) = futures::join! { is_user, is_pat };

        if let Ok(zuser) = user {
            if zuser.user_id().is_some() {
                return Ok(zuser);
            }
        }

        if let Ok(zpat) = pat {
            if zpat.user_id().is_some() {
                return Ok(zpat);
            }
        }

        Ok(AuthUser::None(state.clone()))
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

impl AuthUser {
    fn state(&self) -> &AppState {
        match self {
            AuthUser::User(_, state) => state,
            AuthUser::Pat(_, state) => state,
            AuthUser::None(state) => state,
        }
    }

    pub async fn check_policy(
        &self,
        resource_type: &str,
        resource_id: impl Into<Option<&str>>,
        actions: impl Into<Actions>,
    ) -> Result<(), Error> {
        let db = &self.state().database;
        let user = self.user_id();
        let resource_id: Option<&str> = resource_id.into();

        User::has_permissions(db, user, resource_type, resource_id, actions.into())
            .await
            .ok_or(Error::from_status(StatusCode::FORBIDDEN))
            .map(|_| ())
    }
}
