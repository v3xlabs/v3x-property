use crate::{auth::session::SessionState, models::user_data::UserData, state::AppState};
use openid::{Options, Token};
use poem::{
    handler,
    http::HeaderMap,
    web::{cookie::CookieJar, Data, Json, Query, RealIp, Redirect},
    IntoResponse,
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

#[handler]
pub async fn login(state: Data<&Arc<AppState>>) -> impl IntoResponse {
    // let discovery_url = "http://localhost:8080/realms/master/.well-known/openid-configuration";

    // let http_client = reqwest::Client::new();
    // let discovery_response: DiscoveryResponse = http_client
    //     .get(discovery_url)
    //     .send()
    //     .await.unwrap()
    //     .json()
    //     .await.unwrap();

    // scopes, for calendar for example https://www.googleapis.com/auth/calendar.events
    let scope = "openid email profile".to_string();

    let options = Options {
        scope: Some(scope),
        ..Default::default()
    };

    // Generate the authorization URL
    let authorize_url = state.openid.auth_url(&options);

    println!("OpenID Connect Authorization URL: {}", authorize_url);

    // redirect to the authorization URL
    Redirect::temporary(authorize_url.as_str())
}

#[derive(Deserialize)]
pub struct MyQuery {
    pub session_state: Option<String>,
    pub iss: Option<String>,
    pub code: String,
    pub prompt: Option<String>,
}

#[handler]
pub async fn callback(
    query: Query<MyQuery>,
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
    let user = UserData::new(&oauth_userinfo, &state.database)
        .await
        .unwrap();

    let user_agent = headers.get("user-agent").unwrap().to_str().unwrap();
    let user_ip = ip.0.unwrap().to_string();

    let session = SessionState::new(user.id, user_agent, &user_ip, &state.database)
        .await
        .unwrap();

    let token = session.id;

    Redirect::temporary("http://localhost:3000/me")
        .with_header("Set-Cookie", format!("property.v3x.token={}", token))
}

#[handler]
pub async fn me(state: Data<&Arc<AppState>>, cookies: &CookieJar) -> impl IntoResponse {
    let token = cookies.get("property.v3x.token").unwrap();
    let token = Uuid::parse_str(token.value_str()).unwrap();

    let session = SessionState::get_by_id(token, &state.database)
        .await
        .unwrap();

    let user = UserData::get_by_id(session.user_id, &state.database)
        .await
        .unwrap();

    Json(user)
}

#[handler]
pub async fn get_sessions(state: Data<&Arc<AppState>>, cookies: &CookieJar) -> impl IntoResponse {
    let token = cookies.get("property.v3x.token").unwrap();
    let token = Uuid::parse_str(token.value_str()).unwrap();

    let session = SessionState::get_by_id(token, &state.database)
        .await
        .unwrap();

    let sessions = SessionState::get_by_user_id(session.user_id, &state.database)
        .await
        .unwrap();

    Json(sessions)
}
