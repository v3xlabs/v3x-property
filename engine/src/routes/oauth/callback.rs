use std::sync::Arc;

use openid::Token;
use poem::{
    handler,
    http::HeaderMap,
    web::{Data, RealIp, Redirect, WithHeader},
    IntoResponse, Result,
};
use poem_openapi::{
    param::Query,
    payload::{PlainText, Response},
    ApiResponse, Object, OpenApi,
};
use serde::Deserialize;
use tracing::info;
use url::Url;
use uuid::Uuid;

use super::super::ApiTags;
use crate::{
    auth::hash::hash_session,
    models::{sessions::Session, user::userentry::UserEntry},
    state::AppState,
};

pub struct CallbackApi;

#[derive(ApiResponse)]
pub enum RedirectResponse {
    /// Redirect to the frontend with authentication token
    #[oai(status = 302)]
    Redirect(#[oai(header = "Location")] String),
    /// Bad request
    #[oai(status = 400)]
    BadRequest(PlainText<String>),
}

#[OpenApi]
impl CallbackApi {
    /// /callback
    ///
    /// OpenID Connect callback endpoint, redeems the code and issues a session token
    #[oai(path = "/callback", method = "get", tag = "ApiTags::Auth")]
    pub async fn callback(
        &self,
        state: Query<Option<String>>,
        scope: Query<Option<String>>,
        hd: Query<Option<String>>,
        authuser: Query<Option<String>>,
        code: Query<String>,
        prompt: Query<Option<String>>,
        app_state: Data<&Arc<AppState>>,
        ip: RealIp,
        headers: &HeaderMap,
    ) -> Result<RedirectResponse> {
        let token = app_state.openid.request_token(&code).await.map_err(|_| {
            poem::Error::from_response(
                Redirect::temporary(app_state.openid.redirect_url()).into_response(),
            )
        })?;

        let mut token = Token::from(token);

        let mut id_token = token.id_token.take().unwrap();

        app_state.openid.decode_token(&mut id_token).unwrap();
        app_state
            .openid
            .validate_token(&id_token, None, None)
            .unwrap();

        let oauth_userinfo = app_state.openid.request_userinfo(&token).await.unwrap();

        // Now we must verify the user information, decide wether they deserve access, and if so return a token.
        let user = UserEntry::upsert(&oauth_userinfo, None, &app_state.database)
            .await
            .unwrap();

        let user_agent = headers.get("user-agent").unwrap().to_str().unwrap();
        let user_ip = ip.0.unwrap();

        let token = Uuid::new_v4().to_string();
        let hash = hash_session(&token).unwrap();

        let _session = Session::new(
            &app_state.database,
            &hash,
            user.user_id,
            user_agent,
            &user_ip.into(),
        )
        .await
        .unwrap();

        info!("Issued session token for user {}", user.user_id);

        let mut redirect_url: Url = state
            .0
            .clone()
            .unwrap_or("http://localhost:3000/me".to_string())
            .parse()
            .unwrap();

        redirect_url.set_query(Some(&format!("token={}", token)));
        redirect_url.set_query(Some(&format!("token={}", token)));

        Ok(RedirectResponse::Redirect(redirect_url.to_string()))
    }
}
