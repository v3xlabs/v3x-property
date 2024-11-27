use std::sync::Arc;

use openid::Token;
use poem::{handler, http::HeaderMap, web::{Data, Query, RealIp, Redirect}, IntoResponse};
use serde::Deserialize;
use url::Url;
use uuid::Uuid;

use crate::{auth::hash::hash_session, models::{sessions::Session, users::UserEntry}, state::AppState};


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
) -> impl IntoResponse {
    let mut token = state.openid.request_token(&query.code).await.unwrap();

    let mut token = Token::from(token);

    let mut id_token = token.id_token.take().unwrap();

    state.openid.decode_token(&mut id_token).unwrap();
    state.openid.validate_token(&id_token, None, None).unwrap();

    let oauth_userinfo = state.openid.request_userinfo(&token).await.unwrap();

    format!("Hello {:?}", oauth_userinfo);

    // Now we must verify the user information, decide wether they deserve access, and if so return a token.
    let user = UserEntry::upsert(&oauth_userinfo, None, &state.database)
        .await
        .unwrap();

    let user_agent = headers.get("user-agent").unwrap().to_str().unwrap();
    let user_ip = ip.0.unwrap();

    let token = Uuid::new_v4().to_string();
    let hash = hash_session(&token).unwrap();

    let _session = Session::new(&hash, user.user_id, user_agent, &user_ip.into(), &state.database)
        .await
        .unwrap();

    let mut redirect_url: Url = query
        .state
        .clone()
        .unwrap_or("http://localhost:3000/me".to_string())
        .parse()
        .unwrap();

    redirect_url.set_query(Some(&format!("token={}", token)));

    Redirect::temporary(redirect_url)
        .with_header("Set-Cookie", format!("property.v3x.token={}", token))
}
