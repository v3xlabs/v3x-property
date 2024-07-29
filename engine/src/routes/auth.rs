use crate::{
    auth::{middleware::AuthToken, session::SessionState},
    models::user_data::UserData,
    state::AppState,
};
use openid::{Options, Prompt, Token};
use poem::{
    handler,
    http::HeaderMap,
    web::{Data, Json, Query, RealIp, Redirect},
    Error, IntoResponse,
};
use reqwest::StatusCode;
use serde::Deserialize;
use std::{collections::HashSet, sync::Arc};
use url::Url;

#[derive(Deserialize)]
struct LoginQuery {
    redirect: Option<String>,
}

#[handler]
pub async fn login(query: Query<LoginQuery>, state: Data<&Arc<AppState>>) -> impl IntoResponse {
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
        state: query.redirect.clone(),
        prompt: Some(HashSet::from([Prompt::SelectAccount])),
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
    pub state: Option<String>,
    pub scope: Option<String>,
    pub hd: Option<String>,
    pub authuser: Option<String>,
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
    let user_ip = ip.0.unwrap();

    let session = SessionState::new(user.id, user_agent, &user_ip, &state.database)
        .await
        .unwrap();

    let token = session.id;

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

#[handler]
pub async fn me(state: Data<&Arc<AppState>>, token: AuthToken) -> impl IntoResponse {
    match token {
        AuthToken::Active(active_user) => {
            let user = UserData::get_by_id(active_user.session.user_id, &state.database)
                .await
                .unwrap();

            Json(user).into_response()
        }
        _ => Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
    }
}

#[handler]
pub async fn get_sessions(state: Data<&Arc<AppState>>, token: AuthToken) -> impl IntoResponse {
    match token {
        AuthToken::Active(active_user) => {
            let sessions =
                SessionState::get_by_user_id(active_user.session.user_id, &state.database)
                    .await
                    .unwrap();

            Json(sessions).into_response()
        }
        _ => Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
    }
}

#[handler]
pub async fn delete_sessions(state: Data<&Arc<AppState>>, token: AuthToken) -> impl IntoResponse {
    match token {
        AuthToken::Active(active_user) => {
            let sessions =
                SessionState::invalidate_by_user_id(active_user.session.user_id, &state.database)
                    .await
                    .unwrap();

            Json(sessions).into_response()
        }
        _ => Error::from_string("Not Authenticated", StatusCode::UNAUTHORIZED).into_response(),
    }
}
