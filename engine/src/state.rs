use std::env;

use openid::DiscoveredClient;
use reqwest::Url;
use tracing::warn;

use crate::{auth::oauth::OpenIDClient, database::Database, search::Search};

pub struct AppState {
    pub database: Database,
    // #[cfg(feature = "oauth")]
    pub openid: OpenIDClient,
    pub search: Option<Search>,
}

impl AppState {
    pub async fn from_env() -> Self {
        let database_url = env::var("DATABASE_URL")
            .unwrap_or("postgres://postgres:postgres@localhost:5432/postgres".to_string());

        let database = Database::new(database_url.as_str()).await.unwrap();

        // #[cfg(feature = "oauth")]
        let openid = {
            let openid_client_id = env::var("OPENID_CLIENT_ID").unwrap();
            let openid_client_secret = env::var("OPENID_CLIENT_SECRET").unwrap();
            let openid_redirect = Url::parse(env::var("OPENID_REDIRECT").unwrap().as_str())
                .unwrap()
                .to_string();
            let openid_issuer = env::var("OPENID_ISSUER").unwrap().parse().unwrap();

            DiscoveredClient::discover(
                openid_client_id,
                openid_client_secret,
                openid_redirect,
                openid_issuer,
            )
            .await
            .unwrap()
        };

        let search = match Search::guess().await {
            Ok(search) => Some(search),
            Err(e) => {
                warn!("Failed to initialize search: {}", e);
                None
            }
        };

        Self {
            database,
            openid,
            search,
        }
    }
}
