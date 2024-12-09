use std::env;

use openid::{Client, Discovered, DiscoveredClient, StandardClaims};
use reqwest::Url;
use tracing::warn;

use crate::{
    database::Database,
    modules::{intelligence::Intelligence, search::Search, storage::Storage},
};

pub type OpenIDClient = Client<Discovered, StandardClaims>;

pub struct AppState {
    pub database: Database,
    // #[cfg(feature = "oauth")]
    pub openid: OpenIDClient,
    pub storage: Storage,
    pub intelligence: Option<Intelligence>,
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

            // disable tls verification for local development
            let http_client = reqwest::Client::builder()
                .danger_accept_invalid_certs(
                    env::var("OPENID_ACCEPT_INVALID_CERTS")
                        .unwrap_or("false".to_string())
                        .parse()
                        .unwrap(),
                )
                .build()
                .unwrap();

            DiscoveredClient::discover_with_client(
                http_client,
                openid_client_id,
                openid_client_secret,
                openid_redirect,
                openid_issuer,
            )
            .await
            .unwrap()
        };

        let storage = Storage::guess().await;

        let intelligence = match Intelligence::guess().await {
            Ok(intelligence) => Some(intelligence),
            Err(e) => {
                warn!("Failed to initialize intelligence: {}", e);
                None
            }
        };

        let search = match Search::guess(&intelligence).await {
            Ok(search) => Some(search),
            Err(e) => {
                warn!("Failed to initialize search: {}", e);
                None
            }
        };

        Self {
            database,
            openid,
            storage,
            intelligence,
            search,
        }
    }
}
