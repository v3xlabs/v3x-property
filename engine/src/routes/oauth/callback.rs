use std::sync::Arc;

use openid::Token;
use poem::{
    handler,
    http::HeaderMap,
    web::{Data, Query, RealIp, Redirect, WithHeader},
    IntoResponse, Result,
};
use serde::Deserialize;
use tracing::info;
use url::Url;
use uuid::Uuid;

use crate::{
    auth::hash::hash_session,
    models::{sessions::Session, user::userentry::UserEntry},
    state::AppState,
};

#[derive(Deserialize, Debug)]
pub struct CallbackQuery {
    pub state: Option<String>,
    pub scope: Option<String>,
    pub hd: Option<String>,
    pub authuser: Option<String>,
    pub code: String,
    pub prompt: Option<String>,
}

#[handler]
pub async fn callback(
    query: Query<CallbackQuery>,
    state: Data<&Arc<AppState>>,
    ip: RealIp,
    headers: &HeaderMap,
) -> Result<WithHeader<Redirect>> {
    let mut token = state.openid.request_token(&query.code).await.map_err(|_| {
        poem::Error::from_response(Redirect::temporary(state.openid.redirect_url()).into_response())
    })?;

    let mut token = Token::from(token);

    let mut id_token = token.id_token.take().unwrap();

    state.openid.decode_token(&mut id_token).unwrap();
    state.openid.validate_token(&id_token, None, None).unwrap();

    let oauth_userinfo = state.openid.request_userinfo(&token).await.unwrap();

    // Now we must verify the user information, decide wether they deserve access, and if so return a token.
    let user = UserEntry::upsert(&oauth_userinfo, None, &state.database)
        .await
        .unwrap();

    let user_agent = headers.get("user-agent").unwrap().to_str().unwrap();
    let user_ip = ip.0.unwrap();

    let token = Uuid::new_v4().to_string();
    let hash = hash_session(&token).unwrap();

    let _session = Session::new(
        &state.database,
        &hash,
        user.user_id,
        user_agent,
        &user_ip.into(),
    )
    .await
    .unwrap();

    info!("Issued session token for user {}", user.user_id);

    let mut redirect_url: Url = query
        .state
        .clone()
        .unwrap_or("http://localhost:3000/me".to_string())
        .parse()
        .unwrap();

    redirect_url.set_query(Some(&format!("token={}", token)));

    Ok(Redirect::temporary(redirect_url)
        .with_header("Set-Cookie", format!("property.v3x.token={}; Secure; HttpOnly", token)))
}
