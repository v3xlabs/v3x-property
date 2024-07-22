use std::env;

use crate::{database::Database, openid::OpenIDClient};
use openid::DiscoveredClient;

pub struct AppState {
    pub database: Database,
    pub openid: OpenIDClient,
}

impl AppState {
    pub async fn from_env() -> Self {
        let database_url = env::var("DATABASE_URL")
            .unwrap_or("postgres://postgres:postgres@localhost:5432/postgres".to_string());

        let database = Database::new(database_url.as_str()).await.unwrap();

        let openid_client_id = env::var("OPENID_CLIENT_ID").unwrap_or("devclient".to_string());
        let openid_client_secret = env::var("OPENID_CLIENT_SECRET").unwrap();
        let openid_redirect =
            env::var("OPENID_REDIRECT").unwrap_or("http://localhost:3000/callback".to_string());
        let openid_issuer = env::var("OPENID_ISSUER")
            .unwrap_or("http://localhost:8080/realms/master".to_string())
            .parse()
            .unwrap();

        let openid = DiscoveredClient::discover(
            openid_client_id,
            openid_client_secret,
            openid_redirect,
            openid_issuer,
        )
        .await
        .unwrap();

        Self { database, openid }
    }
}
