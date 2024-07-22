use axum::response::{IntoResponse, Redirect};
use openid::{DiscoveredClient, Options};

pub async fn login() -> impl IntoResponse {
    // let discovery_url = "http://localhost:8080/realms/master/.well-known/openid-configuration";

    // let http_client = reqwest::Client::new();
    // let discovery_response: DiscoveryResponse = http_client
    //     .get(discovery_url)
    //     .send()
    //     .await.unwrap()
    //     .json()
    //     .await.unwrap();

    // Create the OpenID client
    let client_id = "devclient";
    let client_secret = Some("wavt7wfi7VXkv5ex9PMFKOGBBnVhfZzy");
    let redirect_url = "http://localhost:3000/callback";

    let client = DiscoveredClient::discover(
        client_id.to_string(),
        client_secret.map(|s| s.to_string()),
        Some(redirect_url.to_string()),
        "http://localhost:8080/realms/master".parse().unwrap()
        // discovery_response.issuer.parse().unwrap()
    )
    .await.unwrap();

    // Generate the authorization URL
    let authorize_url = client.auth_url(&Options::default());

    println!("OpenID Connect Authorization URL: {}", authorize_url);

    // redirect to the authorization URL
    Redirect::temporary(authorize_url.as_str())
}
