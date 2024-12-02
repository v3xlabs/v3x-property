use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use url::Url;

use super::userentry::UserEntry;

/// A user object that is returned to the client
/// This is a subset of the `UserEntry` struct
/// Use `UserEntry` to query the database for a user
#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct User {
    pub user_id: i32,
    pub oauth_sub: String,
    pub name: String,
    pub picture: Option<Url>,
}

impl From<UserEntry> for User {
    fn from(user: UserEntry) -> Self {
        Self {
            user_id: user.user_id,
            oauth_sub: user.oauth_sub,
            name: user
                .nickname
                .or(user.oauth_data.nickname.clone())
                .or(user.oauth_data.name.clone())
                .unwrap_or("Unknown".to_string()),
            picture: user.oauth_data.picture.clone(),
        }
    }
}
